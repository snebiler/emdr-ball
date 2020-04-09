import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteMatch } from "react-router-dom";
import { getSessionInfo } from '../../actions/sessionActions'
import injectStyle from '../../helpers/incejctStyle';
import socketIOClient from "socket.io-client";
import drip from './drip.mp3'
import drop from './drop.mp3'
import ReactInterval from 'react-interval';


export const Session = (props) => {
    let match = useRouteMatch();
    console.log(props);
    const socket = socketIOClient(`http://localhost:5050`);

    const dispatch = useDispatch();

    // mapStateToProps alternatifi hook
    const { patient, ballShape, drName, ballSpeed, isActive, isSoundPlaying, sound } = useSelector(state => {
        // console.log(state);
        return {
            patient: state.currentSession.patient,
            drName: state.currentSession.drName,
            ballShape: state.currentSession.ballShape,
            direction: state.currentSession.direction,
            ballSpeed: state.currentSession.ballSpeed,
            isActive: state.currentSession.isActive,
            sound: state.currentSession.sound,
            isSoundPlaying: state.currentSession.isSoundPlaying,
        }
    })
    console.log(ballSpeed);

    const keyframesStyle = `
    @keyframes mymoveSession {
        0%   {left: 0px; }
        50% {left: 90%;}
        100% {left: 0px;}
    }
`;
    // Keyframes inject
    injectStyle(keyframesStyle);
    socket.on('disconnect', () => {
        console.log("socket bağlantısı " + socket.connected);

    })
    // ComponentDidMount
    useEffect(() => {
        // console.log(socket);
        socket.on("fromServer", data => {
            console.log(data);
            if (data.hasSessionChanged) {
                console.log("session changed");
                dispatch(getSessionInfo(match.params.sessionId));

            }
        })
        socket.on("welcome", data => console.log(data))
        dispatch(getSessionInfo(match.params.sessionId));
    }, [])

    const speedArray = [0, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.8, 0.5]
    const style = {
        container: {
            height: "100%",
            width: "100%"
        },
    }

    const soundToPlay = new Audio(sound === 'drip' ? drip : drop)
    const playSound = () => {
        console.log("SOUND PLAYING");
        soundToPlay.play()
    };

    const shape = new Map();
    const marginTopp = "";

    shape.set('square', {
        marginTop: marginTopp,
        width: "5rem",
        height: "5rem",
        background: '#990000',
        position: "relative",
        WebkitAnimation: `${isActive ? 'mymoveSession' : 'moveSessionStop'} ${ballSpeed && speedArray[ballSpeed]}s infinite linear`,/* infinite */
        animationDirection: 'normal',
        animationTimingFunciton: 'linear',
    })
    shape.set('circle', {
        marginTop: marginTopp,
        width: "6rem",
        height: "6rem",
        background: '#990000',
        borderRadius: "50%",
        position: "relative",
        WebkitAnimation: `${isActive ? 'mymoveSession' : 'moveSessionStop'} ${ballSpeed && speedArray[ballSpeed]}s infinite linear`,/* infinite */
        animationDirection: 'normal',
        animationTimingFunciton: 'linear',
    })
    shape.set('diamond', {
        marginTop: marginTopp,
        position: "relative",
        backgroundColor: '#990000',
        height: "5rem",
        transform: "rotate(-45deg)",
        width: "5rem",
        WebkitAnimation: `${isActive ? 'mymoveSession' : 'moveSessionStop'} ${ballSpeed && speedArray[ballSpeed]}s infinite linear`,/* infinite */
        animationDirection: 'normal',
        animationTimingFunciton: 'linear',
    })

    // admin or patient page 

    const inAdminPage = <div className="ml-3">Hasta adı: <strong className="text-capitalize">{patient}.</strong></div>
    const inSessionPage = <div>
        <p className="border-bottom-dark ml-3">Sayın <strong className="text-capitalize">{patient}</strong>, seansınıza hoşgeldiniz. Doktorunuz birazdan seansı başlatacaktır.</p>
        <p className="ml-3 mt-0">Doktor adı: <strong className="text-capitalize">{drName}.</strong></p>
    </div>

    return (
        <div className="" style={{ height: "100vh"}} >
            <div className="border border-dark border-top-0 border-left-0 border-right-0 mb-1 mt-3">
                {props.admin ? inAdminPage : inSessionPage}
            </div>
            <div>
            </div>

            <div className="pt-4 pl-3" style={style.container}>
                <div className="mt-4" style={shape.get(`${ballShape}`)} ></div>
            </div>
            <ReactInterval timeout={((speedArray[ballSpeed] * 1000) / 2)} enabled={isActive && isSoundPlaying} callback={() => { console.log(((speedArray[ballSpeed] * 1000) / 2)); playSound() }} />
        </div>
    )
}

