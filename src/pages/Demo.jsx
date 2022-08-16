/** @jsxImportSource @emotion/react */
import Miniview from '../features/miniview/Miniview';
import testing_array from '../data/testing_array';
import Draggable from '../features/draggable/Draggable';
import DragContainer from '../features/draggable/DragContainer';
import AlternateDraggable from '../features/draggable/AlternateDraggable'
import { useSelector, useDispatch } from 'react-redux';
import { addComparison, selectMiniviews } from '../features/miniview/miniviewSlice';
import { moveAlternateDraggable, selectAlternateDraggables } from '../features/draggable/alternateDraggableSlice';
import { selectDraggables } from '../features/draggable/draggableSlice';
import { css } from '@emotion/react';
import { useState } from 'react';
import { addDraggable, removeDraggable } from '../features/draggable/draggableSlice';
import { addAlternateDraggable, removeAlternateDraggable } from '../features/draggable/alternateDraggableSlice';
import { addMiniview, removeMiniview, selectComparison, removeComparison } from '../features/miniview/miniviewSlice';
import { Button, Stack, Divider } from '@mui/material'
import testing_array2 from '../data/testing_array2';
import testing_array3 from '../data/testing_array3';
import { index } from 'd3-array';

export default function Demo() {

  // Demo of redux miniview
  const previewSelector = useSelector(selectMiniviews)['preview']
  const miniviewSelector = useSelector(selectMiniviews)
  const draggableSelector = useSelector(selectDraggables)
  const alternateDraggableSelector = useSelector(selectAlternateDraggables)
  const comparableSelector = useSelector(selectComparison)

  const [testId, setTestId] = useState(5)

  const [startY, setStartY] = useState(900)

  const [comparisonSpacing, setComparisonSpacing] = useState(1)

  const dispatch = useDispatch()

  // 85 px
  function addNewDraggable() {
    let data = determineRandomArray()
    let color = Math.floor((Math.random() * 360))
    addNewMiniview(testId, data, color)
    dispatch(addDraggable({
      key: testId
    }))

    setTestId(id => id + 1)
    setStartY(startY => startY + 85)
    Object.entries(alternateDraggableSelector).forEach(item => {
      let adjustedLocation = item[1].coordinateY + 85
      dispatch(moveAlternateDraggable({
        key: item[0],
        coordinateY: adjustedLocation
      }))
    })
  }

  function addNewAlternateDraggable() {
    let data = determineRandomArray()
    let color = Math.floor((Math.random() * 360))
    addNewMiniview(testId, data, color)
    dispatch(addAlternateDraggable({
      key: testId,
      coordinateY: startY
    }))

    setTestId(id => id + 1)
    setStartY(startY => startY + 50)
  }

  function determineRandomArray() {
    let choice = Math.floor((Math.random() * 3))
    let chosenArray;
    switch (choice) {
      case 1:
        chosenArray = testing_array
        break
      case 2:
        chosenArray = testing_array2
        break
      default:
        chosenArray = testing_array3
    }

    return chosenArray
  }

  function addNewMiniview(id, data, color, start, end) {

    dispatch(addMiniview({
      key: id,
      array: data,
      color: color,
      start: start,
      end: end
    }))
  }

  function removeADraggable() {
    let keys = draggableSelector
    let choice = keys[Math.floor((Math.random() * keys.length))]
    if (keys.length > 0) {
      dispatch(removeMiniview({
        key: choice
      }))
    }
    dispatch(removeDraggable({
      key: choice
    }))
    Object.entries(alternateDraggableSelector).forEach(item => {
      let adjustedLocation = item[1].coordinateY - 85
      dispatch(moveAlternateDraggable({
        key: item[0],
        coordinateY: adjustedLocation
      }))
    })

  }

  function removeAnAlternateDraggable() {
    let keys = Object.keys(alternateDraggableSelector)
    let choice = keys[Math.floor((Math.random() * keys.length))]
    if (keys.length > 0) {
      dispatch(removeMiniview({
        key: choice
      }))
    }
    dispatch(removeAlternateDraggable({
      key: choice
    }))
    setStartY(startY => startY - 50)

  }

  // TODO - navigation?
  function takePreviewSnapshot(event) {
    if(event.ctrlKey){
      dispatch(removeComparison())
    }
    else{
      dispatch(addComparison({
        key: testId,
        array: previewSelector.array,
        color: previewSelector.color,
        start: previewSelector.start,
        end: previewSelector.end
      }))
  
  
      setTestId(id => id + 1)
      setStartY(startY => startY + 50)
    }
  }

  let styling = css(css`.example {
    width: 500px;
    height: 700px;
    border: 1px solid black;
}
.draggable {
    /* cursor: crosshair; */
    border: 1px solid grey;
}
.alternateDraggable{
  height: 50px;
  width: 96%;
  margin-bottom: 35px;
  border:solid black 1px;
  flex-direction: row;
  left: 2%;
  
}
.preview {
    border: 1px solid black;
    background-color: whitesmoke;
    z-index: 10;
}
.Container{
    border: 2px solid grey;
    margin-bottom: 1ch;
}`)

  return (
    <>
      <div css={styling}>
        <Stack mt={5} direction='row' alignItems={'center'} justifyContent={'center'} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
          <Button variant='outlined' onClick={addNewDraggable}>Add a Draggable</Button>
          <Button variant='outlined' onClick={addNewAlternateDraggable}>Add an Alternate Draggable</Button>
          <Button variant='outlined' onClick={removeADraggable}>Remove a Draggable</Button>
          <Button variant='outlined' onClick={removeAnAlternateDraggable}>Remove an Alternate Draggable</Button>
        </Stack>

        {previewSelector.visible && <Miniview
          className={'preview'}
          array={previewSelector.array}
          coordinateX={previewSelector.coordinateX}
          coordinateY={previewSelector.coordinateY}
          width={previewSelector.width}
          height={previewSelector.height}
          beginning={previewSelector.start}
          fin={previewSelector.end}
          color={previewSelector.color}
          id={previewSelector.id}
          absolutePositioning={true}
        />}
        {previewSelector.visible && (Object.keys(comparableSelector).length !== 0 && Object.keys(comparableSelector).map((item, index) => {
          return <Miniview
            className={'preview'}
            key={item}
            array={comparableSelector[item].array}
            color={comparableSelector[item].color}
            coordinateX={previewSelector.coordinateX}
            coordinateY={previewSelector.coordinateY + 18 * (index+1)}
            width={previewSelector.width}
            height={previewSelector.height}
            displayPreview={false}
            beginning={comparableSelector[item].start}
            fin={comparableSelector[item].end}
            absolutePositioning={true}
          />
        }))
        }


        <h2>Draggable Container: Items re-order themselves</h2>

        <DragContainer starting={draggableSelector}>
          {draggableSelector.map(item => {
            return (
              <Draggable key={item}>
                <Miniview
                  array={miniviewSelector[item].array}
                  color={miniviewSelector[item].color}
                  doSomething={takePreviewSnapshot}
                />
              </Draggable>
            )
          })}
        </DragContainer>

        <h2>Miniview Component:</h2>

        {Object.entries(alternateDraggableSelector).map(item => {
          return (<AlternateDraggable initialY={item[1].coordinateY} id={item[0]} key={item[0]}>
            <Miniview
              key={item[0]}
              array={miniviewSelector[item[0]].array}
              color={miniviewSelector[item[0]].color}
              displayPreview={false}
              beginning={miniviewSelector[item[0]].start}
              fin={miniviewSelector[item[0]].end}
            />
          </AlternateDraggable>)
        })}

        <Miniview
          array={testing_array}
          color={350}
          id={5}
          chosen={
            {
              "chromosome": "at3",
              "start": "9541483",
              "end": "9542114",
              "key": "at3g26110"
            }
          }
          height={50}
        />

        <h2>Alternate Draggable - Absolute positioning with the nearest Y-coordinate multiple:</h2>

      </div>
    </>
  );
}

