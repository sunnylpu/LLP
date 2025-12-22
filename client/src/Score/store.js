import {configureStore} from '@reduxjs/toolkit'
import foodSlicer from './slice'
export const store=configureStore({
    reducer:{
        todos:foodSlicer
    }
})