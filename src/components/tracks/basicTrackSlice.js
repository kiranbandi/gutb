import { createSlice } from '@reduxjs/toolkit';
import testing_array from '../../data/testing_array';
import testing_array2 from '../../data/testing_array2';
import testing_array3 from '../../data/testing_array3';
import testing_array_dh1 from '../../data/testing_array_dh1';
import testing_array_dh2 from '../../data/testing_array_dh2';
import testing_array_dh3 from '../../data/testing_array_dh3';

const trackTypes = ['heatmap', 'histogram', 'scatter', 'line']

const initialState = {
    // Currently just a placeholder 
    BasicTracks: {
        'dh1': {
            array: testing_array_dh1,
            color: 50
        },
        'dh2': {
            array: testing_array_dh2,
            color: 150
        },
        'dh3': {
            array: testing_array_dh3,
            color: 250
        },
    },
}


export const basicTrackSlice = createSlice({
    name: 'basictrack',
    initialState,

    reducers: {

        addBasicTrack: (state, action) => {
            if (!state.BasicTracks[action.payload.key]) {
                state.BasicTracks[action.payload.key] = action.payload
            }
        },
        removeBasicTrack: (state, action) => {
            delete state.BasicTracks[action.payload.key]
        },
        moveBasicTrack: (state, action) => {
            state.BasicTracks[action.payload.key].coordinateX = action.payload.coordinateX
            state.BasicTracks[action.payload.key].coordinateY = action.payload.coordinateY
            state.BasicTracks[action.payload.key].viewFinderY = action.payload.viewFinderY
            state.BasicTracks[action.payload.key].viewFinderX = action.payload.viewFinderX
        },
        updateData: (state, action) => {
            state.BasicTracks[action.payload.key].array = action.payload.array
            if (action.payload.start !== undefined) {
                state.BasicTracks[action.payload.key].start = action.payload.start
            }
            if (action.payload.end !== undefined) {
                state.BasicTracks[action.payload.key].end = action.payload.end
            }
            if (action.payload.boxWidth !== undefined) {
                state.BasicTracks[action.payload.key].boxWidth = action.payload.boxWidth
            }
        },
        updateTrack: (state, action) => {
            if (action.payload.key === undefined) return
            state.BasicTracks[action.payload.key].offset = action.payload.offset
            state.BasicTracks[action.payload.key].zoom = action.payload.zoom

        },
        toggleTrackType: (state, action) => {
            if (action.payload.id === undefined) return
            let currentTrackType = state.BasicTracks[action.payload.id].trackType,
                currentTypeIndex = trackTypes.indexOf(currentTrackType);
            // push the track type to next in the array, if at end loop back to beginning
            state.BasicTracks[action.payload.id].trackType = trackTypes[currentTypeIndex + 1 >= 4 ? 0 : currentTypeIndex + 1]
        },
        updateBothTracks: (state, action) => {
            if (action.payload.topKey !== undefined) {
                state.BasicTracks[action.payload.topKey].offset = action.payload.topOffset
                state.BasicTracks[action.payload.topKey].zoom = action.payload.topZoom
            }
            if (action.payload.bottomKey !== undefined) {
                state.BasicTracks[action.payload.bottomKey].offset = action.payload.bottomOffset
                state.BasicTracks[action.payload.bottomKey].zoom = action.payload.bottomZoom
            }
        },
        changeBasicTrackColor: (state, action) => {
            state.BasicTracks[action.payload.key].color = action.payload.color
        },
        changeZoom: (state, action) => {
            state.BasicTracks[action.payload.key].zoom = action.payload.zoom
        },
        pan: (state, action) => {
            state.BasicTracks[action.payload.key].offset = action.payload.offset
        },
        setSelection: (state, action) => {
            state.BasicTracks[action.payload.key].selection = action.payload.selection
        },
        clearSelection: (state, action) => {
            state.BasicTracks[action.payload.key].selection = undefined
        },
        deleteAllBasicTracks: (state, action) => {
            state.BasicTracks = {}
        }
    }
})


export const { updateTrack, toggleTrackType, updateBothTracks, deleteAllBasicTracks, addBasicTrack, removeBasicTrack, moveBasicTrack, updateData, changeBasicTrackColor, changeZoom, pan, setSelection, clearSelection } = basicTrackSlice.actions;


export const selectBasicTracks = (state) => state.basictrack.BasicTracks

export default basicTrackSlice.reducer;