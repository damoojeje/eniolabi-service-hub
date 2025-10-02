import React from 'react'
import Image from 'next/image'

interface IconProps {
  className?: string
}

// Official Home Assistant Logo using SVG asset
export const HomeAssistantIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <Image 
    src="/asset/homeassistant.svg" 
    alt="Home Assistant" 
    width={24} 
    height={24} 
    className={className}
  />
)

// Official Portainer Logo using SVG asset
export const PortainerIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <Image 
    src="/asset/portainer.svg" 
    alt="Portainer" 
    width={24} 
    height={24} 
    className={className}
  />
)

// Official n8n Logo using SVG asset
export const N8nIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <Image 
    src="/asset/n8n.svg" 
    alt="n8n" 
    width={24} 
    height={24} 
    className={className}
  />
)


// Official Node-RED Logo using SVG asset
export const NodeRedIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <Image 
    src="/asset/nodered.svg" 
    alt="Node-RED" 
    width={24} 
    height={24} 
    className={className}
  />
)

// Official Wiki.js Logo
export const WikiJsIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 4.2L19 8v8l-7 3.8L5 16V8l7-3.8z"/>
    <path d="M8 10h8v2H8v-2zm0 3h8v2H8v-2z"/>
  </svg>
)

// Official VS Code Logo
export const VSCodeIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.5 2L9 10.5 4.5 7 2 8.5l7.5 8.5L2 24l2.5 1.5L9 21.5l8.5 8.5L22 28V4L17.5 2z"/>
  </svg>
)

// Official File Browser Logo
export const FileBrowserIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
  </svg>
)

// Official Uptime Kuma Logo using SVG asset
export const UptimeKumaIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <Image 
    src="/asset/uptimekuma.svg" 
    alt="Uptime Kuma" 
    width={24} 
    height={24} 
    className={className}
  />
)

// Official Zigbee2MQTT Logo using SVG asset
export const Zigbee2MQTTIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <Image 
    src="/asset/zigbee2mqtt.svg" 
    alt="Zigbee2MQTT" 
    width={24} 
    height={24} 
    className={className}
  />
)

// Official WhenNXT Logo
export const WhenNXTIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M16 12l-4-4-4 4h8z"/>
  </svg>
)

// Official Nginx Logo using SVG asset
export const NginxIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <Image 
    src="/asset/nginx.svg" 
    alt="Nginx" 
    width={24} 
    height={24} 
    className={className}
  />
)

// Official Mailchimp Logo using SVG asset
export const MailchimpIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <Image 
    src="/asset/mailchimp.svg" 
    alt="Mailchimp" 
    width={24} 
    height={24} 
    className={className}
  />
)

// Media Dashboard Icon (Homepage/Media Stack)
export const MediaDashboardIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg`}>
    <svg 
      viewBox="0 0 24 24" 
      fill="white" 
      className="w-4 h-4"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  </div>
)

// Service icon mapping
export const serviceIconMap = {
  'homeassistant': HomeAssistantIcon,
  'portainer': PortainerIcon,
  'n8n': N8nIcon,
  'mediadashboard': MediaDashboardIcon,
  'media dashboard': MediaDashboardIcon,
  'nodered': NodeRedIcon,
  'wikijs': WikiJsIcon,
  'vscodeserver': VSCodeIcon,
  'filebrowser': FileBrowserIcon,
  'uptimekuma': UptimeKumaIcon,
  'zigbee2mqtt': Zigbee2MQTTIcon,
  'whennxt': WhenNXTIcon,
  'nginx': NginxIcon,
  'nginxui': NginxIcon,
  'mailchimp': MailchimpIcon,
} as const

export type ServiceIconName = keyof typeof serviceIconMap
