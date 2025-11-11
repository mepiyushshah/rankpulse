import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const title = searchParams.get('title') || 'Untitled Article'
    const primaryColor = searchParams.get('primaryColor') || '#00AA45'
    const style = searchParams.get('style') || 'solid_bold'
    const textPosition = searchParams.get('textPosition') || 'center'
    const fontStyle = searchParams.get('fontStyle') || 'bold'

    // Determine text color based on background brightness
    const getTextColor = (hexColor: string) => {
      const r = parseInt(hexColor.slice(1, 3), 16)
      const g = parseInt(hexColor.slice(3, 5), 16)
      const b = parseInt(hexColor.slice(5, 7), 16)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      return brightness > 155 ? '#000000' : '#FFFFFF'
    }

    const textColor = getTextColor(primaryColor)

    // Different layout styles
    const getBackgroundStyle = () => {
      switch (style) {
        case 'solid_bold':
        default:
          return {
            background: primaryColor,
          }
      }
    }

    const getTextAlignment = () => {
      switch (textPosition) {
        case 'left':
          return {
            alignItems: 'flex-start',
            paddingLeft: '80px',
          }
        case 'right':
          return {
            alignItems: 'flex-end',
            paddingRight: '80px',
          }
        default:
          return {
            alignItems: 'center',
          }
      }
    }

    const getFontWeight = () => {
      return fontStyle === 'bold' ? 900 : 700
    }

    const backgroundStyle = getBackgroundStyle()
    const textAlignment = getTextAlignment()
    const fontWeight = getFontWeight()
    const finalTextColor = textColor

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px',
            ...backgroundStyle,
            ...textAlignment,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '1000px',
            }}
          >
            <h1
              style={{
                fontSize: title.length > 60 ? 58 : 72,
                fontWeight,
                color: finalTextColor,
                lineHeight: 1.2,
                margin: 0,
                textAlign: textPosition === 'center' ? 'center' : textPosition === 'left' ? 'left' : 'right',
                wordWrap: 'break-word',
              }}
            >
              {title}
            </h1>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
