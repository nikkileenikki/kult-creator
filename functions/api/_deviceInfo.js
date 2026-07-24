function parseOS(ua) {
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Mac OS X/i.test(ua)) return 'macOS'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iOS/i.test(ua)) return 'iOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Unknown OS'
}

function parseBrowser(ua) {
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari'
  return 'Unknown browser'
}

function parseDeviceType(ua) {
  if (/iPad|Tablet/i.test(ua)) return 'Tablet'
  if (/Mobi|Android(?!.*Tablet)|iPhone/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

export function describeDevice(userAgent) {
  const ua = userAgent || ''
  return `${parseBrowser(ua)} · ${parseOS(ua)} · ${parseDeviceType(ua)}`
}

export function getRequestLocation(request) {
  const cf = request.cf || {}
  return {
    ip:      request.headers.get('CF-Connecting-IP') || '',
    country: cf.country || '',
    city:    cf.city || '',
  }
}
