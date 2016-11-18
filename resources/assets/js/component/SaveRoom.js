import React from 'react';

class SaveRoom extends React.Component {

    constructor(props) {
        super(props);
        if (props.room){
            this.state = {
                roomName: props.room.name,
                checked: props.room.isSaved,
                wait: false
            };
        }else{
            this.state = {
                roomName: props.roomName,
                checked: props.checked,
                wait: false
            };
        }
    }

    handleClick = () => {
        const {
            roomName, checked, wait
        } = this.state;

        if (!wait){
            this.setState({
                wait: true
            });
            if (checked){
                $.ajax({
                    url: '/user/' + app.currentUser.name + '/savedrooms/remove/' + roomName,
                    method: 'POST'
                })
                    .done(() => {
                        this.setState({
                            checked: false
                        });
                    })
                    .fail(() => {
                        alertify.error('Removing saved room failed.');
                    })
                    .always(() => {
                        this.setState({
                            wait: false
                        });
                    });
            }else{
                $.ajax({
                    url: '/user/' + app.currentUser.name + '/savedrooms/add/' + roomName,
                    method: 'POST',
                })
                    .done(() => {
                        this.setState({
                            checked: true
                        });
                    })
                    .fail(() => {
                        alertify.error('Saving room failed.');
                    })
                    .always(() => {
                        this.setState({
                            wait: false
                        });
                    });
            }
        }
    }

    render() {

        const {
            checked, wait
        } = this.state;

        var className = 'save-room';
        if (checked){
            className += ' checked';
        }
        if (wait){
            className += ' spinner';
        }
        if (this.props.className){
            className += ' ' + this.props.className;
        }

        return (
            <span className={className} style={this.props.style} onClick={this.handleClick} />
        );
    }

}

export default SaveRoom;
