import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "./App.css";
import "firebase/compat/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useRef, useState } from "react";
import profilePic from './profile.png'
firebase.initializeApp({
  apiKey: "AIzaSyBS8fras1CZJFoX55w_9vujoQVdKiGvWYU",
  authDomain: "superchat-4172a.firebaseapp.com",
  projectId: "superchat-4172a",
  storageBucket: "superchat-4172a.appspot.com",
  messagingSenderId: "711698685713",
  appId: "1:711698685713:web:4abd90c26d5ffcbc4ab6b0",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="p-2"><i><link rel="icon" href="%PUBLIC_URL%/send.png" /></i>SuperChat-v2</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return <button className='rounded m-5'  type="button" onClick={signInWithGoogle}>SignIn</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()} className='rounded'>signout</button>
  );
}

function ChatRoom() {
  const messagesref = firestore.collection("messages");
  const query = messagesref.orderBy("createdAt").limitToLast(25);
  const [messages, loading, error] = useCollectionData(query, {
    idField: "id",
  });
  const [FormValue, setFormValue] = useState("");
  const dummy = useRef() 
  const sendMessages = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    const defaultPhotourl = profilePic;
    const finalPhotourl = photoURL || defaultPhotourl;
    if (FormValue.trim() !== "") {
      await messagesref.add({
        text: FormValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL: finalPhotourl,
      });
    }
    setFormValue("");
    dummy.current.scrollIntoView({behavior:'smooth'})
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <>
    <main>
      {messages &&
        messages.map((msg) => <ChatMsg key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
    </main>
      <form onSubmit={sendMessages}>
        <input
        className="rounded m-2"
          value={FormValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit" className="rounded m-2">send</button>
      </form>
    </>
  );
}
function ChatMsg(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div>
      <div className={`message ${messageClass} mb-3`}>
        <img src={photoURL}/>
        {/* <small>{auth.currentUser.displayName}</small> */}

        <p className="mb-0">{text}</p>
      </div>
    </div>
  );
}

export default App;
