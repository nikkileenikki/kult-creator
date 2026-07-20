import { request } from '../api'

export const fetchTemplates  = ()           => request('GET', '/report-templates')
export const fetchTemplate   = (id)         => request('GET', `/report-templates/${id}`)
export const createTemplate  = (data)       => request('POST', '/report-templates', data)
export const updateTemplate  = (id, patch)  => request('PATCH', `/report-templates/${id}`, patch)
export const deleteTemplate  = (id)         => request('DELETE', `/report-templates/${id}`)
