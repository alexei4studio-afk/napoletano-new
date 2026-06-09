'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type CampaignContextType = {
  bannerHeight: number
  setBannerHeight: (h: number) => void
}

const CampaignContext = createContext<CampaignContextType>({
  bannerHeight: 0,
  setBannerHeight: () => {},
})

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [bannerHeight, setBannerHeight] = useState(0)
  return (
    <CampaignContext.Provider value={{ bannerHeight, setBannerHeight }}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaignBanner() {
  return useContext(CampaignContext)
}
