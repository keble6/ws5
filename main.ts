function leadingZero (num: number) {
    if (num < 10) {
        let list: number[] = []
        for (let value of list) {
        	
        }
        return "0" + num
    } else {
        return convertToText(num)
    }
}
// Send readings to radio receiver
input.onButtonPressed(Button.A, function () {
    readingsLength = dateTimeReadings.length
    if (readingsLength != 0) {
        for (let index = 0; index <= readingsLength - 1; index++) {
            ack = 0
            // Wait until we get ACK
            while (ack == 0) {
                basic.pause(1)
            }
            ack = 0
            while (ack == 0) {
                basic.pause(1)
            }
            ack = 0
        }
    }
})
function airPressure () {
    BMP280.PowerOn()
    pressure = BMP280.pressure()
    BMP280.PowerOff()
    return pressure / 100
}
function dateTimeString () {
    return "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year() + " " + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute())
}
// Press both A & B to set clock
input.onButtonPressed(Button.AB, function () {
    DS3231.dateTime(
    2020,
    9,
    14,
    1,
    15,
    0,
    0
    )
    basic.showIcon(IconNames.Yes)
})
// Delete readings array
input.onButtonPressed(Button.B, function () {
    readingsLength = dateTimeReadings.length
    for (let index = 0; index < readingsLength; index++) {
        dateTimeReadings.removeAt(0)
        airPressureReadings.removeAt(0)
        temperatureReadings.removeAt(0)
    }
})
function temperature () {
    dht11_dht22.queryData(
    DHTtype.DHT11,
    DigitalPin.P1,
    true,
    false,
    true
    )
    if (dht11_dht22.sensorrResponding()) {
        return "" + dht11_dht22.readData(dataType.temperature) + "," + dht11_dht22.readData(dataType.humidity)
    } else {
        // Warn if DHT11 error
        return "No DHT11 response!"
    }
}
/**
 * Set alarm time and mode
 */
let pressure = 0
let readingsLength = 0
let ack = 0
let temperatureReadings: string[] = []
let airPressureReadings: number[] = []
let dateTimeReadings: string[] = []
// This is the maximum number of records in the readings array
let readingsMax = 200
dateTimeReadings = []
airPressureReadings = []
temperatureReadings = []
ack = 0
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
// Send initial readings to USB as a test
serial.writeLine("" + (dateTimeString()))
serial.writeLine("" + (airPressure()))
serial.writeLine("" + (temperature()))
// Poll pin P0 to see if alarm is set
basic.forever(function () {
    // Check if the alarm has triggered
    if (pins.digitalReadPin(DigitalPin.P0) == 0 && DS3231.status() == 9) {
        // Limit the number of stored readings
        if (dateTimeReadings.length < readingsMax) {
            dateTimeReadings.push(dateTimeString())
            airPressureReadings.push(airPressure())
            temperatureReadings.push(temperature())
            DS3231.clearAlarmFlag(alarmNum.A1)
        }
    }
    // Display the number of stored readings
    basic.showNumber(dateTimeReadings.length)
    basic.pause(100)
    basic.clearScreen()
    basic.pause(9900)
})
