import { memo } from 'react'
import { useSelector } from 'react-redux'
import { nanoid } from '@reduxjs/toolkit';
import BasicTrack from 'components/tracks/BasicTrack';
import OrthologLinks from 'components/tracks/OrthologLinks'
import ImageTrack from 'components/tracks/ImageTrack'
import { selectBasicTracks } from 'components/tracks/basicTrackSlice';
import { selectGenome } from 'components/tracks/genomeSlice';
import { selectDraggables } from './draggableSlice';


/* Essentially just returns a smaller version of a basic track when dragging
TODO make work with the new histogram
*/
export const DragPreview = memo(function DragPreview({ item, groupID, width, height, className, component, index, dragGroup, isDark }) {

    const basicTrackSelector = useSelector(selectBasicTracks)
    const genomeSelector = useSelector(selectGenome)

    // Do I need this for some tracks?
    const draggableSelector = useSelector(selectDraggables)
    if (component == "BasicTrack") {
        return (
            <div className={className}>
                <BasicTrack
                    array={item.length < 4 ? genomeSelector[item].array : genomeSelector[item.substring(0, 3)].array}
                    color={basicTrackSelector[item].color}
                    id={nanoid() + "preview"}
                    zoom={basicTrackSelector[item].zoom}
                    pastZoom={basicTrackSelector[item].pastZoom}
                    offset={basicTrackSelector[item].offset}
                    height={height / 2}
                    noScale={true}
                    trackType={basicTrackSelector[item].trackType}
                // isDark={false}
                // normalize={false}

                />
            </div>
        )
    }
    else if (component == "OrthologLinks") {
        return <OrthologLinks index={index} dragGroup={dragGroup}></OrthologLinks>
    }
    else if (component == "bitmap") {
        let suffix = isDark ? "track_dark" : "track"
        let image = 'files/track_images/' + item + suffix + ".png"
        return (
            <ImageTrack
                image={[image]}
                id={item}
                zoom={basicTrackSelector[item].zoom}

                offset={basicTrackSelector[item].offset}
                // cap={cap}
                color={basicTrackSelector[item].color}
            />
        )
    }


})