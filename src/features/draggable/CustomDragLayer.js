import { useDragLayer } from 'react-dnd'
import { ItemTypes } from './ItemTypes.js'
import { DragPreview } from './DragPreview.js'
import { nanoid } from '@reduxjs/toolkit'


const layerStyle = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
}


export const CustomDragLayer = (props) => {
    const { isDragging, item, itemType, initialOffset, currentOffset } =
        useDragLayer((monitor) => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            isDragging: monitor.isDragging(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
        }))

    function renderItem() {
        switch (itemType) {
            case ItemTypes.BOUNDED:
                {
                    let original;
                    const topRow = document.getElementById(props.groupID[0])
                    topRow ? original = topRow.getBoundingClientRect() : original = document.getElementById(item.id).getBoundingClientRect()
                    let adjustment = props.groupID.length > 1 ? document.getElementById(props.groupID[1]).getBoundingClientRect().y - original.y : 0
   
                    const above = original.top + original.height * 0.1
                    const below = original.top + adjustment * (props.groupID.length - 1) - 5

                    if (props.groupID <= 1 || (currentOffset.y > above && currentOffset.y < below)) {
                        return <DragPreview item={item.id} groupID={props.groupID} height={original.height} width={original.width} />
                    }
                    return (
                        props.groupID.map(item => {
                            return <DragPreview item={item} groupID={props.groupID} height={original.height} width={original.width} key={nanoid()}/>
                        })
                    )
                }
            default:
                return null
        }
    }

    function moveThePreview(currentOffset) {
        if (!currentOffset) {
            return {
                display: 'none',
            }
        }
       
        let { x, y } = currentOffset
        x -= document.getElementById(item.id).getBoundingClientRect().width
        let original;
        const topRow = document.getElementById(props.groupID[0])
        topRow ? original = topRow.getBoundingClientRect() : original = document.getElementById(item.id).getBoundingClientRect()
        let adjustment = props.groupID.length > 1 ? document.getElementById(props.groupID[1]).getBoundingClientRect().y - original.y : 0
        
        if (props.groupID.length > 1 && currentOffset.y > original.top + adjustment * (props.groupID.length - 1 )- 6) {

                y -= ((Math.abs(adjustment)) * (props.groupID.length -1 ))
            }
        const transform = `translate(${x}px, ${y}px)`
        return {
            width: document.getElementById(item.id).getBoundingClientRect().width,
            transform,
            WebkitTransform: transform,
        }
    }


    if (!isDragging) {
        return null
    }
    return (
        <div style={layerStyle}>
            <div style={moveThePreview(currentOffset)}>
                {renderItem()}
            </div>
        </div>
    )
}