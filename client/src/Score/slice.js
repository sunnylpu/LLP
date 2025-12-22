import {createSlice} from '@reduxjs/toolkit';


const scoreSlice=createSlice({
    name:"slice",
    initialState:{count:0},
    reducers:{
        addScore:(state)=>{state.count++},
        minusScore:(state)=>{state.count--},
    }
})
export const {addScore,minusScore}=scoreSlice.actions
export default scoreSlice.reducer