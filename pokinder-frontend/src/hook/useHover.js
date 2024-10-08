import { useState } from 'react'

export default function useHover() {
    const [isHover, setIsHover] = useState(false)
    const events = {
        onMouseEnter: () => setIsHover(true),
        onMouseLeave: () => setIsHover(false),
    }
    return [isHover, events]
}