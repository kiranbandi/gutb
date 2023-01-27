import { configureStore } from '@reduxjs/toolkit';
import miniviewReducer from '../features/miniview/miniviewSlice';
import alternateDraggableReducer from '../features/draggable/alternateDraggableSlice';
import draggableReducer from '../features/draggable/draggableSlice';
import basicTrackReducer from '../components/tracks/basicTrackSlice';
import annotationReducer from 'features/annotation/annotationSlice';
import genomeReducer from '../components/tracks/genomeSlice';
import complicatedTrackReducer from '../components/tracks/complicatedTrackSlice'

export const store = configureStore({
  reducer: {
    miniview: miniviewReducer,
    alternateDraggable: alternateDraggableReducer,
    draggable: draggableReducer,
    basictrack : basicTrackReducer,
    annotation: annotationReducer,
    genome: genomeReducer,
    complicatedtrack: complicatedTrackReducer,
  },
});
