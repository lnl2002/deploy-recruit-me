import { BACKEND_URL } from '@/utils/env'
import axios from 'axios'

export const test = async () => {
    try {
        const res = await axios.get(`${BACKEND_URL}/examples`);
        return res?.data
    } catch (error) {
        console.log('Error test', error)
    }

}