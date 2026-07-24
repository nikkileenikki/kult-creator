import { request } from '../api'

export const fetchAgreementSheets = ()          => request('GET', '/agreement-sheets')
export const createAgreementSheet  = (data)      => request('POST', '/agreement-sheets', data)
export const updateAgreementSheet  = (id, patch) => request('PATCH', `/agreement-sheets/${id}`, patch)
