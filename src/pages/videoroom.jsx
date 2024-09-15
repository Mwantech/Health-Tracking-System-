import React, { useRef, useState, useEffect } from 'react';

const VideoCall = ({ roomCode }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isCallStarted, setIsCallStarted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      localStreamRef.current = stream;
    } catch (err) {
      setError('Failed to access camera and microphone');
      console.error('Error accessing media devices:', err);
    }
  };

  const createPeerConnection = () => {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate);
      }
    };

    peerConnection.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    localStreamRef.current.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current);
    });

    peerConnectionRef.current = peerConnection;
  };

  const startCall = async () => {
    await startLocalStream();
    createPeerConnection();

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      console.log('Offer created:', offer);
      console.log('Using room code:', roomCode);
      
      setIsCallStarted(true);
    } catch (err) {
      setError('Failed to start the call');
      console.error('Error starting call:', err);
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    localVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;
    setIsCallStarted(false);
  };

  const styles = {
    fullPage: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    videoContainer: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '1200px',
      gap: '20px',
    },
    videoWrapper: {
      width: '45%',
    },
    subtitle: {
      fontSize: '18px',
      marginBottom: '10px',
    },
    video: {
      width: '100%',
      maxHeight: '60vh',
      backgroundColor: '#000',
      border: '1px solid #ccc',
    },
    buttonGroup: {
      marginTop: '20px',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
      border: 'none',
      borderRadius: '5px',
      marginRight: '10px',
    },
    startButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
    },
    endButton: {
      backgroundColor: '#f44336',
      color: 'white',
    },
    errorAlert: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      padding: '10px',
      borderRadius: '5px',
      marginTop: '20px',
    },
    errorTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.fullPage}>
      <h1 style={styles.title}>Video Call</h1>
      <div style={styles.videoContainer}>
        <div style={styles.videoWrapper}>
          <h2 style={styles.subtitle}>Local Video</h2>
          <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />
        </div>
        <div style={styles.videoWrapper}>
          <h2 style={styles.subtitle}>Remote Video</h2>
          <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
        </div>
      </div>
      <div style={styles.buttonGroup}>
        <button
          onClick={startCall}
          disabled={isCallStarted}
          style={{...styles.button, ...styles.startButton}}
        >
          Start Call
        </button>
        <button
          onClick={endCall}
          disabled={!isCallStarted}
          style={{...styles.button, ...styles.endButton}}
        >
          End Call
        </button>
      </div>
      {error && (
        <div style={styles.errorAlert}>
          <h3 style={styles.errorTitle}>Error</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default VideoCall;