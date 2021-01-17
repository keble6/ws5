// Commands are sent to microbit with a letter followed by $
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.Dollar), function () {
    command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Dollar))
    command = command.charAt(0)
    serial.writeLine(command)
    serial.writeLine("" + (command.length))
    // If "u" then upload the readings to Bluetooth
    // If "s" then set RTC time
    // If "d" then delete the stored readings
    if (command == "u") {
        upload()
    } else if (command == "s") {
        setTime()
    } else if (command == "d") {
        deleteReadings()
    } else {
        command = ""
    }
})
function deleteReadings () {
    readingsLength = dateTimeReadings.length
    for (let index = 0; index < readingsLength; index++) {
        dateTimeReadings.pop()
        weatherReadings.pop()
    }
}
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
// Upload readings to Bluetooth
input.onButtonPressed(Button.A, function () {
    upload()
})
function getReadings () {
    BME280.PowerOn()
    readings = "" + BME280.pressure(BME280_P.hPa) + "," + BME280.temperature(BME280_T.T_C) + "," + BME280.humidity()
    BME280.PowerOff()
    return readings
}
function dateTimeString () {
    return "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year() + " " + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute()) + ","
}
function upload () {
    basic.showLeds(`
        . . # . .
        . # # # .
        # . # . #
        . . # . .
        . . # . .
        `)
    readingsLength = dateTimeReadings.length
    if (readingsLength != 0) {
        for (let index = 0; index <= readingsLength - 1; index++) {
            bluetooth.uartWriteString(dateTimeReadings[index])
            basic.pause(10)
            bluetooth.uartWriteLine(weatherReadings[index])
            basic.pause(10)
        }
    } else {
        bluetooth.uartWriteString("No stored readings!")
    }
    basic.showIcon(IconNames.Yes)
}
// Press both A & B to set RTC time
input.onButtonPressed(Button.AB, function () {
    setTime()
})
function setTime () {
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
}
// Delete stored readings
input.onButtonPressed(Button.B, function () {
    deleteReadings()
})
let readings = ""
let readingsLength = 0
let command = ""
let weatherReadings: string[] = []
let dateTimeReadings: string[] = []
bluetooth.startUartService()
// This is the maximum number of records in the readings array
let readingsMax = 200
dateTimeReadings = []
weatherReadings = []
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
    // Test for alarm time NB B7 of status may be 1 if oscillator stopped
    // Test B0 of status - this is set when alarm 1 has triggered
    if (pins.digitalReadPin(DigitalPin.P0) == 0 && DS3231.status() % 2 == 1) {
        if (dateTimeReadings.length <= readingsMax) {
            dateTimeReadings.push(dateTimeString())
            weatherReadings.push(getReadings())
            DS3231.clearAlarmFlag(alarmNum.A1)
        }
    }
    basic.showNumber(dateTimeReadings.length)
    basic.pause(100)
    basic.clearScreen()
    basic.pause(9900)
    serial.writeString("" + (dateTimeString()))
    serial.writeLine("" + (getReadings()))
})
