function leadingZero (num: number) {
    if (num < 10) {
        return "0" + num
    } else {
        return convertToText(num)
    }
}
bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Square)
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showIcon(IconNames.SmallSquare)
})
// Send readings to radio receiver
input.onButtonPressed(Button.A, function () {
    basic.showLeds(`
        . . # . .
        . # # # .
        # . # . #
        . . # . .
        . . # . .
        `)
})
function getReadings () {
    BME280.PowerOn()
    readings = "" + BME280.pressure(BME280_P.Pa) + "," + BME280.temperature(BME280_T.T_C) + "," + BME280.humidity()
    BME280.PowerOff()
    return readings
}
function dateTimeString () {
    return "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year() + " " + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute()) + ","
}
// Press both A & B to set clock
input.onButtonPressed(Button.AB, function () {
    DS3231.dateTime(
    2021,
    1,
    15,
    1,
    9,
    7,
    0
    )
    basic.showIcon(IconNames.Yes)
})
// Delete readings array
input.onButtonPressed(Button.B, function () {
	
})
let readings = ""
bluetooth.startUartService()
// This is the maximum number of records in the readings array
let readingsMax = 200
let dateTimeReadings: number[] = []
let weatherReadings: number[] = []
DS3231.configureINTCN(interruptEnable.Enable)
DS3231.clearAlarmFlag(alarmNum.A1)
DS3231.clearAlarmFlag(alarmNum.A2)
DS3231.setAlarm(
alarmNum.A1,
mode.Minute,
1,
1,
0,
0
)
DS3231.disableAlarm(alarmNum.A1, interruptEnable.Enable)
DS3231.disableAlarm(alarmNum.A2, interruptEnable.Disable)
// Poll pin P0 to see if alarm is set
basic.forever(function () {
    basic.showIcon(IconNames.Heart)
    basic.pause(100)
    basic.clearScreen()
    basic.pause(9900)
    serial.writeString("" + (dateTimeString()))
    serial.writeLine("" + (getReadings()))
    BME280.PowerOff()
})
