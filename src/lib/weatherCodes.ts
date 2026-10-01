import {
  CircleHelp,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  type LucideIcon,
  Sun,
} from 'lucide-react';

interface WeatherCondition {
  label: string;
  icon: LucideIcon;
}

export function getWeatherCondition(code: number | undefined): WeatherCondition {
  switch (code) {
    case 0:
      return { label: 'Céu limpo', icon: Sun };
    case 1:
      return { label: 'Predominantemente limpo', icon: CloudSun };
    case 2:
      return { label: 'Parcialmente nublado', icon: CloudSun };
    case 3:
      return { label: 'Encoberto', icon: Cloud };
    case 45:
    case 48:
      return { label: 'Nevoeiro', icon: CloudFog };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return { label: 'Garoa', icon: CloudDrizzle };
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return { label: 'Chuva', icon: CloudRain };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return { label: 'Neve', icon: CloudSnow };
    case 95:
    case 96:
    case 99:
      return { label: 'Tempestade', icon: CloudLightning };
    default:
      return { label: 'Indisponível', icon: CircleHelp };
  }
}
