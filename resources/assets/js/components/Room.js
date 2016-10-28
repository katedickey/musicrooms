var React = require('react');
var UserList = require('./UserList');
var AddTrackButton = require('./AddTrackButton');
var Queue = require('./Queue');

module.exports = class Room extends React.Component {

    syncInterval = null;
    syncFails = 0;
    receivedState = null;
    userData = {};
    trackData = {};

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            users: [],
            queue: [],
            currentTrack: null,
        };
    }

    handleBeforeUnload = () => {
        $.ajax({
            url: `/room/${this.props.room.name}/leave`,
            method: 'post',
            async: false,
            data: {
                _token: app.csrf_token
            }
        });
    }

    getData(request, callback){

        if (Object.keys(request).length > 0) {
            $.ajax({
                url: `/room/${app.currentRoom.name}/getdata`,
                method: 'get',
                dataType: 'json',
                data: request,
                //data: JSON.stringify(_.assign({}, request, {_token: app.csrf_token})),
                contentType: 'application/json; charset=utf-8',
            })
                .done(function (data) {
                    callback(data);
                });
        }
    }

    shouldComponentUpdate(nextProps, nextState){
        if (
            this.state.currentTrack !== nextState.currentTrack ||
            this.state.loading !== nextState.loading ||
            this.state.queue.length !== nextState.queue.length ||
            this.state.users.length !== nextState.users.length
        ){
            return true;
        }

        for (let i = 0; i < this.state.queue.length; i++){
            if (this.state.queue[i] !== nextState.queue[i]){
                return true;
            }
        }

        for (let i = 0; i < this.state.users.length; i++){
            if (this.state.users[i] !== nextState.users[i]){
                return true;
            }
        }

        return false;
    }

    updateState (){
        this.setState({
            users: this.receivedState.users.map((username) => (this.userData[username] || username)),
            queue: this.receivedState.queue.map((trackid) => this.trackData[track.id]),
            currentTrack: this.trackData[this.receivedState.currentTrack]
        });
    }

    processStateChange (newState){
        var newUsers, newTracks;
        if (!this.receivedState){
            newUsers = new Set(newState.users);
            newTracks = new Set(newState.queue);
            if (!_.isNil(newState.currentTrack)) {
                newTracks.add(newState.currentTrack)
            }
        }else{
            newUsers = new Set(newState.users.filter((username) => {
                return !this.userData.hasOwnProperty(username);
            }));

            newTracks = new Set(newState.queue.filter((trackid) => {
                return !this.trackData.hasOwnProperty(trackid);
            }));

            if (!_.isNil(newState.currentTrack) && !this.trackData.hasOwnProperty(newState.currentTrack)){
                newTracks.add(newState.currentTrack);
            }
        }

        this.receivedState = newState;

        this.updateState();

        if (newUsers.size || newTracks.size){
            this.getData({
                users: Array.from(newUsers),
                tracks: Array.from(newTracks)
            }, (data) => {
                if (data.users) {
                    for (let user of data.users) {
                        this.userData[user.name] = user;
                    }
                }
                if (data.tracks) {
                    for (let track of data.tracks) {
                        this.trackData[track.id] = _.assign(track, {owner: this.userData[username]});
                    }
                }

                this.updateState();
            });
        }
    }

    sync = () => {
        $.ajax({
            url: `/room/${this.props.room.name}/syncme`,
            method: 'get',
            dataType: 'json'
        })
            .done((data) => {
                this.syncFails = 0;
                this.processStateChange(data);
            })
            .fail(() => {
                this.syncFails++;
                if (this.syncFails == 10){
                    this.props.unmount();
                    bootbox.alert('Connection lost', function(){
                        location = "/rooms";
                    });
                }
            });
    }

    componentDidMount(){
        $.ajax({
            url: `/room/${this.props.room.name}/join`,
            method: 'post',
            dataType: 'json',
            data: {
                _token: app.csrf_token
            }
        })
            .done((data) => {
                if (this.state.loading){
                    this.setState({
                        loading: false
                    });
                }
                this.processStateChange(data);
                window.addEventListener('beforeunload', this.handleBeforeUnload);
                this.syncInterval = setInterval(this.sync, 1000);
            });
    }

    componentWillUnmount(){
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        clearInterval(this.syncInterval);
    }

    render() {
        var room = this.props.room;
        if (this.state.loading){
            return (
                <div className="text-center">
                    <h3><i className="spinner spinner" /> Joining Room...</h3>
                </div>
            )
        }else{
            return (
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="panel panel-default player-panel">
                                <div className="panel-body">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="panel panel-default queue-panel">
                                <div className="panel-heading">
                                    <div className="panel-title">Queue</div>
                                </div>
                                <Queue tracks={this.state.queue}/>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="panel panel-default chat-panel">
                                <div className="panel-heading">
                                    <div className="panel-title">Chat</div>
                                </div>
                                <div className="panel-body">
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="panel panel-default users-panel">
                                <div className="panel-heading">
                                    <div className="panel-title">Users</div>
                                </div>
                                <UserList users={this.state.users}/>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
};
