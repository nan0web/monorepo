/**
 * @class DeviceModel
 * @description A simple model representing a device with a name.
 * @param {Partial<DeviceModel>} [input={}] - Optional initial values.
 */
class DeviceModel {
  /**
   * @type {string}
   */
  deviceName

  /**
   * @param {Partial<DeviceModel>} [input={}]
   */
  constructor(input = {}) {
    Object.assign(this, input)
  }
}
