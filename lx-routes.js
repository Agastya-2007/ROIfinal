(function(){
  'use strict';

  var LX_ROUTES = {
    presets: {
      'infant-protection': 'step2-infant-protection.html',
      'forklift-safety': 'step2-forklift-safety.html',
      'asset-tracking': 'step2-asset-tracking.html'
    },
    presetAliases: {
      'Infant Protection': 'infant-protection',
      'Forklift Safety': 'forklift-safety',
      'Asset Tracking': 'asset-tracking',
      'infant-protection': 'infant-protection',
      'forklift-safety': 'forklift-safety',
      'asset-tracking': 'asset-tracking'
    },
    results: {
      'infant-protection': {
        'Infant Security and Tracking': {
          'UWB': 'step4-infant-protection-infant-security-uwb.html',
          'BLE AOA': 'step4-infant-protection-infant-security-ble-aoa.html',
          'BLE AoA': 'step4-infant-protection-infant-security-ble-aoa.html',
          'BLE': 'step4-infant-protection-infant-security-ble-aoa.html'
        },
        'Staff Tracking for Enhanced Security': {
          'BLE AOA': 'step4-infant-protection-staff-tracking-ble-aoa.html',
          'BLE AoA': 'step4-infant-protection-staff-tracking-ble-aoa.html',
          'BLE': 'step4-infant-protection-staff-tracking-ble-aoa.html',
          'UWB': 'step4-infant-protection-staff-tracking-uwb.html'
        },
        'Staff Tracking for Operational Efficiency': {
          'BLE AOA': 'step4-infant-protection-staff-tracking-ble-aoa.html',
          'BLE AoA': 'step4-infant-protection-staff-tracking-ble-aoa.html',
          'BLE': 'step4-infant-protection-staff-tracking-ble-aoa.html',
          'UWB': 'step4-infant-protection-staff-tracking-uwb.html'
        }
      },
      'forklift-safety': {
        'Forklift Collision Prevention': {
          'UWB': 'step4-forklift-safety-collision-prevention-uwb.html',
          'BLE AOA': 'step4-forklift-safety-collision-prevention-ble-aoa.html',
          'BLE AoA': 'step4-forklift-safety-collision-prevention-ble-aoa.html',
          'BLE': 'step4-forklift-safety-collision-prevention-ble-aoa.html'
        },
        'Operator Safety Monitoring': {
          'BLE AOA': 'step4-forklift-safety-operator-safety-ble-aoa.html',
          'BLE AoA': 'step4-forklift-safety-operator-safety-ble-aoa.html',
          'BLE': 'step4-forklift-safety-operator-safety-ble-aoa.html',
          'UWB': 'step4-forklift-safety-operator-safety-uwb.html'
        }
      },
      'asset-tracking': {
        'Real-Time Medical Equipment Tracking': {
          'UWB': 'step4-asset-tracking-medical-equipment-uwb.html',
          'BLE RSSI': 'step4-asset-tracking-medical-equipment-ble-rssi.html'
        },
        'Real-Time Staff Tracking': {
          'BLE AoA': 'step4-asset-tracking-staff-tracking-ble-aoa.html',
          'BLE AOA': 'step4-asset-tracking-staff-tracking-ble-aoa.html',
          'UWB': 'step4-asset-tracking-staff-tracking-uwb.html'
        },
        'Real-Time Staff Movement Tracking': {
          'BLE AoA': 'step4-asset-tracking-staff-tracking-ble-aoa.html',
          'BLE': 'step4-asset-tracking-staff-tracking-ble-aoa.html',
          'UWB': 'step4-asset-tracking-staff-tracking-uwb.html'
        }
      }
    },
    keywords: {
      'infant-protection': [
        'infant', 'infants', 'baby', 'babies', 'maternity', 'pediatric', 'pediatrics',
        'child', 'children', 'newborn', 'newborns', 'abduction', 'ward', 'crib', 'nursery'
      ],
      'forklift-safety': [
        'forklift', 'forklifts', 'fleet', 'fleets', 'vehicle', 'vehicles', 'collision',
        'collisions', 'driver', 'drivers', 'operator', 'operators', 'warehouse', 'warehouses',
        'warehousing', 'pedestrian', 'pedestrians', 'machinery', 'plant safety', 'traffic',
        'factory floor'
      ],
      'asset-tracking': [
        'asset', 'assets', 'equipment', 'medical', 'pump', 'pumps', 'wheelchair', 'wheelchairs',
        'tool', 'tools', 'pallet', 'pallets', 'inventory', 'device', 'devices', 'biomedical',
        'operating room', 'optimization'
      ]
    },
    defaultPreset: 'asset-tracking'
  };

  LX_ROUTES.matchQuery = function(query) {
    if (!query || typeof query !== 'string') return LX_ROUTES.defaultPreset;
    var raw = query.toLowerCase();
    var clean = raw.replace(/[^\w\s]/g, ' ');
    var words = clean.split(/\s+/).filter(function(w){
      return w.length > 0 && w !== 'or';
    });
    if (words.length === 0) return LX_ROUTES.defaultPreset;

    var scores = {
      'infant-protection': 0,
      'forklift-safety': 0,
      'asset-tracking': 0
    };
    var presets = ['infant-protection', 'forklift-safety', 'asset-tracking'];

    presets.forEach(function(p){
      var kwList = LX_ROUTES.keywords[p] || [];
      kwList.forEach(function(kw){
        var kwLower = kw.toLowerCase().trim();
        if (kwLower === 'or') return;
        if (kwLower.indexOf(' ') !== -1) {
          var regex = new RegExp('\\b' + kwLower.replace(/\s+/g, '\\s+') + '\\b', 'g');
          var m = clean.match(regex);
          if (m) scores[p] += m.length;
        } else {
          words.forEach(function(w){
            if (w === kwLower) scores[p]++;
          });
        }
      });
    });

    var maxScore = 0;
    var bestPreset = null;
    var isTie = false;

    presets.forEach(function(p){
      var s = scores[p];
      if (s > maxScore) {
        maxScore = s;
        bestPreset = p;
        isTie = false;
      } else if (s === maxScore && s > 0) {
        isTie = true;
      }
    });

    if (maxScore === 0) return LX_ROUTES.defaultPreset;
    if (isTie) return 'asset-tracking';
    return bestPreset;
  };

  LX_ROUTES.resolveTarget = function(preset, useCase, tech) {
    var pKey = LX_ROUTES.presetAliases[preset] || preset;
    var pMap = LX_ROUTES.results[pKey];
    if (!pMap) return 'step1.html';
    var uMap = pMap[useCase];
    if (!uMap) {
      var uKeys = Object.keys(pMap);
      for (var i = 0; i < uKeys.length; i++) {
        if (uKeys[i].toLowerCase().indexOf((useCase || '').toLowerCase()) !== -1 ||
            (useCase || '').toLowerCase().indexOf(uKeys[i].toLowerCase()) !== -1) {
          uMap = pMap[uKeys[i]];
          break;
        }
      }
    }
    if (!uMap) return 'step1.html';
    var target = uMap[tech];
    if (!target) {
      var tNorm = (tech || '').replace(/\s+/g, '').toUpperCase();
      var tKeys = Object.keys(uMap);
      for (var j = 0; j < tKeys.length; j++) {
        if (tKeys[j].replace(/\s+/g, '').toUpperCase() === tNorm) {
          target = uMap[tKeys[j]];
          break;
        }
      }
    }
    return target || 'step1.html';
  };

  window.LX_ROUTES = LX_ROUTES;
})();
