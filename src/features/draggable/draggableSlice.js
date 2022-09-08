import { createSlice } from "@reduxjs/toolkit";
import update from 'immutability-helper'

const initialState = {
    // currently a placeholder
    draggables: ['zero', 'one', 'two'],
    group: [],

}

export const draggableSlice = createSlice({
    name: 'draggable',
    initialState,

    reducers: {
        moveDraggable: (state, action) => {
            state.draggables[action.payload.key].index = action.payload.index

        },
        addDraggable: (state, action) => {
            state.draggables.push(action.payload.key)
        },

        removeDraggable: (state, action) => {
            let index = state.draggables.indexOf(action.payload.key)
            state.draggables.splice(index, 1)
        },
        switchDraggable: (state, action) => {

            // Switch Index is passed in, but the index of the item being dragged is... fuzzier. Better to take it from the store
            let switchIndex = state.draggables.indexOf(action.payload.switchKey)
            let startIndex = state.draggables.indexOf(action.payload.startKey)
            let startKey = action.payload.startKey
            state.draggables.splice(startIndex, 1)
            state.draggables.splice(switchIndex,0, startKey)
        },
        insertDraggable: (state, action) => {
            let reference = state.draggables.indexOf(action.payload.startKey)
            let moving = state.draggables.indexOf(action.payload.id)
            let index = action.payload.index
            if( reference > moving ) index = index * -1
            state.draggables.splice(moving,1)
            state.draggables.splice(reference + index, 0, action.payload.id)
        }
        ,
        toggleGroup: (state, action) => {
            let index = state.group.indexOf(action.payload.id);
        
            index > -1 ? state.group.splice(index, 1) : state.group.push(action.payload.id);

        },
        clearGroup: (state, action) => {
            state.group.length = 0;
        },

    }
})

export const { moveDraggable, addDraggable, removeDraggable, switchDraggable, insertDraggable, toggleGroup, clearGroup } = draggableSlice.actions

export const selectDraggables = (state) => state.draggable.draggables
export const selectGroup = (state) => state.draggable.group



export default draggableSlice.reducer
