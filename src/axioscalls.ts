import axios from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'
export interface TypeAffaire {
    idtypeaffaire: number
    typeaffaire: string
    bactif: number
}
export interface ApiResponseTAL {
  success?: boolean;
  message?: string;
  data?: TypeAffaire[];
}

export interface UniteOrg {
  iduniteorg: number;
  iduoparente: number | null;
  nomuniteorg: string;
  descriptionuniteorg: string;
  bcache: number;
  codeordre: string;
}
export interface ApiResponseUOL {
  success?: boolean;
  message?: string;
  data?: UniteOrg[];
}
// Interface générique pour les réponses API
interface ApiResponse<T> {
    success: boolean
    message: string
    data?: T[]
}

export async function getTypesAffaireListe(server: string = '', page: string): Promise<ApiResponseTAL> {
    const urltal: string = `${server}${page}`
    try {
        const response: AxiosResponse<TypeAffaire[]> = await axios.get(urltal)
        const respData: ApiResponseTAL = {
            "success": true,
            "message": `ok`,
            "data": response.data
        }
        console.log(respData)
        return respData
    } catch (error) {
        return traiteAxiosError(error as AxiosError)
    }
}

export async function getUnitesOrgListe(server: string = '', page: string, jsonCriteres: string = '{}'): Promise<ApiResponseUOL> {
    console.log(jsonCriteres)
    const urluol: string = `${server}${page}`
    const params = new URLSearchParams([['jsoncriteres', jsonCriteres]])
    try {
        const response: AxiosResponse<UniteOrg[]> = await axios.get(urluol, { params })
        const respData: ApiResponseUOL = {
            "success": true,
            "message": `ok`,
            "data": response.data
        }
        console.log(respData)
        return respData
    } catch (error) {
        return traiteAxiosError(error as AxiosError)
    }
}

function traiteAxiosError<T>(error: AxiosError): ApiResponse<T> {
    let msgErr: string = ''
    if (error.response) {
        msgErr = `${error.response.data}<br>${error.response.status}<br>${error.response.headers}`    
    } else if (error.request.responseText) {
        msgErr = error.request.responseText
    } else {
        msgErr = error.message
    }
    const respData: ApiResponse<T> = {
        "success": false,
        "message": `ERREUR. ${msgErr}`,
    }
    return(respData)
}