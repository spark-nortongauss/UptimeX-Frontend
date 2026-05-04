const extractTagValue = (tags = [], keyCandidates = []) => {
  if (!Array.isArray(tags) || tags.length === 0) return null
  const loweredKeys = keyCandidates.map((key) => String(key).toLowerCase())
  const match = tags.find((tag) => loweredKeys.includes(String(tag?.tag || '').toLowerCase()))
  return match?.value || null
}

export const buildAiPayload = (alarm = {}, source = 'alarm') => {
  const eventId = alarm?.eventid || alarm?.eventId || alarm?.id || null
  const hostId = alarm?.hostId || alarm?.host_id || alarm?.hostid || alarm?.hostDetails?.hostid || null

  const technologiesFromTags = extractTagValue(alarm?.tags, ['technology', 'technologies', 'tech'])
  const serviceFromTags = extractTagValue(alarm?.tags, ['service', 'svc'])
  const siteFromTags = extractTagValue(alarm?.tags, ['site', 'location', 'region'])

  return {
    eventId: eventId ? String(eventId) : null,
    hostId: hostId ? String(hostId) : null,
    rowId: alarm?.id ? String(alarm.id) : eventId ? String(eventId) : null,
    triggerName: alarm?.problem || alarm?.name || null,
    eventType: source,
    alarmName: alarm?.problem || alarm?.name || null,
    severity: alarm?.severity || null,
    technologies: technologiesFromTags || null,
    service: serviceFromTags || null,
    site: siteFromTags || alarm?.group || null,
    timestamp: alarm?.time || null,
    kpis: alarm?.opdata || null,
  }
}
