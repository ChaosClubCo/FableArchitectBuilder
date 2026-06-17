
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect } from 'react';
import { BuildingType } from '../types';

interface UseKeyboardControlsProps {
  enabled: boolean;
  onToolSelect: (t: BuildingType) => void;
  onRotateCamera: (dir: number) => void;
  onRotateBuilding: () => void;
  onToggleConsole: () => void;
  onManualSave?: () => void;
  activeBuildings?: BuildingType[];
}

export const useKeyboardControls = ({
  enabled,
  onToolSelect,
  onRotateCamera,
  onRotateBuilding,
  onToggleConsole,
  onManualSave,
  activeBuildings
}: UseKeyboardControlsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default save and trigger our save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (enabled && onManualSave) {
          onManualSave();
        }
        return;
      }

      if (e.key === '`') { onToggleConsole(); return; }
      if (!enabled) return;

      const key = e.key.toLowerCase();

      // Camera
      if (key === 'q') onRotateCamera(-1);
      if (key === 'e') onRotateCamera(1);
      
      // Building Rotation
      if (key === 'r') onRotateBuilding();

      // Try selecting active building from current category / tab (1-5)
      if (activeBuildings && ['1', '2', '3', '4', '5'].includes(key)) {
        const index = parseInt(key, 10) - 1;
        if (index >= 0 && index < activeBuildings.length) {
          onToolSelect(activeBuildings[index]);
          return;
        }
      }

      // Tools Fallback Map
      const shortcutMap: Record<string, BuildingType> = {
        '1': BuildingType.Road, '2': BuildingType.Residential, '3': BuildingType.Commercial,
        '4': BuildingType.Industrial, '5': BuildingType.Park, '6': BuildingType.PowerPlant,
        '7': BuildingType.WaterTower, '8': BuildingType.PoliceStation, '9': BuildingType.FireStation,
        '0': BuildingType.School, 'b': BuildingType.None, 'delete': BuildingType.None, 'backspace': BuildingType.None, 
        'u': BuildingType.Upgrade, 
        'w': BuildingType.Windmill, 'm': BuildingType.MarketSquare, 'a': BuildingType.MagicAcademy,
        'l': BuildingType.Library, 'k': BuildingType.Bakery
      };

      if (shortcutMap[key]) onToolSelect(shortcutMap[key]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onToolSelect, onRotateCamera, onRotateBuilding, onToggleConsole, activeBuildings]);
};
