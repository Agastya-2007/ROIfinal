(function(){
  'use strict';

  window.TECH_COMPARISON_DATA = {
    technologies: ['UWB', 'BLE RSSI', 'BLE AoA'],
    presetUseCases: {
      'infant-protection': {
        'Infant Security and Tracking': ['UWB', 'BLE AOA'],
        'Staff Tracking for Enhanced Security': ['BLE AOA', 'UWB'],
        'Staff Tracking for Operational Efficiency': ['BLE AOA', 'UWB']
      },
      'forklift-safety': {
        'Forklift Collision Prevention': ['UWB', 'BLE AOA'],
        'Operator Safety Monitoring': ['BLE AOA', 'UWB']
      },
      'asset-tracking': {
        'Real-Time Medical Equipment Tracking': ['UWB', 'BLE RSSI'],
        'Real-Time Staff Tracking': ['BLE AoA', 'UWB'],
        'Real-Time Staff Movement Tracking': ['BLE AoA', 'UWB']
      }
    },
    useCaseTechs: {
      'Infant Security and Tracking': ['UWB', 'BLE AOA'],
      'Staff Tracking for Enhanced Security': ['BLE AOA', 'UWB'],
      'Staff Tracking for Operational Efficiency': ['BLE AOA', 'UWB'],
      'Forklift Collision Prevention': ['UWB', 'BLE AOA'],
      'Operator Safety Monitoring': ['BLE AOA', 'UWB'],
      'Real-Time Medical Equipment Tracking': ['UWB', 'BLE RSSI'],
      'Real-Time Staff Tracking': ['BLE AoA', 'UWB'],
      'Real-Time Staff Movement Tracking': ['BLE AoA', 'UWB']
    },
    metrics: [
      {
        label: 'Typical accuracy',
        values: {
          'UWB': '10-30 cm',
          'BLE RSSI': '2-5 m',
          'BLE AoA': '0.5-1 m',
          'BLE AOA': '0.5-1 m'
        }
      },
      {
        label: 'Relative cost',
        values: {
          'UWB': 'High',
          'BLE RSSI': 'Low',
          'BLE AoA': 'Medium',
          'BLE AOA': 'Medium'
        }
      },
      {
        label: 'Infrastructure',
        values: {
          'UWB': 'Anchors and tags',
          'BLE RSSI': 'Fixed receivers and tags',
          'BLE AoA': 'Antenna-array locators and tags',
          'BLE AOA': 'Antenna-array locators and tags'
        }
      },
      {
        label: 'Setup effort',
        values: {
          'UWB': 'High (anchor survey and power)',
          'BLE RSSI': 'Low (RF survey recommended)',
          'BLE AoA': 'Medium (locator calibration)',
          'BLE AOA': 'Medium (locator calibration)'
        }
      },
      {
        label: 'Best suited for',
        values: {
          'UWB': 'Precision-critical tracking',
          'BLE RSSI': 'Room and zone presence',
          'BLE AoA': 'Sub-meter at moderate cost',
          'BLE AOA': 'Sub-meter at moderate cost'
        }
      },
      {
        label: 'Tag battery life',
        values: {
          'UWB': '6 months to 2 years',
          'BLE RSSI': '1 to 3 years',
          'BLE AoA': '1 to 3 years',
          'BLE AOA': '1 to 3 years'
        }
      }
    ]
  };
})();
