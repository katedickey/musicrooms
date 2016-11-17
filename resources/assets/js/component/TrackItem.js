import React from 'react';
import ScrollyText from './ScrollyText';

function TrackItem (props) {
    var track = props.track;

    if (track.type == 'file' || track.type == 'soundcloud'){
        var name = `${track.title || 'Unknown Title'} - ${track.artist || 'Unknown Artist'}`;
    }else if (track.type == 'youtube'){
        var name = track.title;
    }

    return (
        <div className="dyn-block-row">
            {
                app.currentUser && track.owner.name == app.currentUser.name && (
                    <div className="track-remove rigid-right" onClick={props.onRequestRemove}><i className="fa fa-trash"></i></div>
                )
            }
            <div className="track-duration rigid-right">{durationString(track.duration)}</div>
            <div className="track-reorder rigid-left"><i className="fa fa-bars"></i></div>
            <ScrollyText className="track-name fluid">{name}</ScrollyText>
        </div>
    );
}

export default TrackItem;
