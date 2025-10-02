import React from 'react'
import { 
  HomeIcon,
  CubeIcon,
  CogIcon,
  FilmIcon,
  CommandLineIcon,
  BookOpenIcon,
  CodeBracketIcon,
  FolderIcon,
  ChartBarIcon,
  RadioIcon,
  CalendarIcon,
  GlobeAltIcon,
  ServerIcon
} from '@heroicons/react/24/outline'
import { serviceIconMap, ServiceIconName } from './icons/ServiceIcons'

interface ServiceIconProps {
  serviceName: string
  className?: string
  showHoverEffect?: boolean
}

export default function ServiceIcon({ 
  serviceName, 
  className = "h-6 w-6", 
  showHoverEffect = false 
}: ServiceIconProps) {
  const normalizedName = serviceName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') as ServiceIconName
  
  // Get the official icon component
  const IconComponent = serviceIconMap[normalizedName]
  
  if (IconComponent) {
    return (
      <div className={`transition-all duration-300 ${showHoverEffect ? 'group-hover:scale-110 group-hover:text-blue-500' : ''}`}>
        <IconComponent className={className} />
      </div>
    )
  }
    
    // Fallback icons based on service type/category
  const fallbackIcon = (() => {
      if (serviceName.toLowerCase().includes('home')) return <HomeIcon className={className} />
      if (serviceName.toLowerCase().includes('docker')) return <CubeIcon className={className} />
      if (serviceName.toLowerCase().includes('code')) return <CodeBracketIcon className={className} />
      if (serviceName.toLowerCase().includes('file')) return <FolderIcon className={className} />
      if (serviceName.toLowerCase().includes('media')) return <FilmIcon className={className} />
      if (serviceName.toLowerCase().includes('wiki')) return <BookOpenIcon className={className} />
      if (serviceName.toLowerCase().includes('monitor')) return <ChartBarIcon className={className} />
      if (serviceName.toLowerCase().includes('calendar')) return <CalendarIcon className={className} />
      if (serviceName.toLowerCase().includes('radio') || serviceName.toLowerCase().includes('iot')) return <RadioIcon className={className} />
      if (serviceName.toLowerCase().includes('nginx') || serviceName.toLowerCase().includes('web')) return <GlobeAltIcon className={className} />
      return <ServerIcon className={className} />
  })()
  
  return (
    <div className={`transition-all duration-300 ${showHoverEffect ? 'group-hover:scale-110 group-hover:text-blue-500' : ''}`}>
      {fallbackIcon}
    </div>
  )
}