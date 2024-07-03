import { useRef, useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,sendEmailVerification} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { collection, query, where, getDocs } from "firebase/firestore";


const Login = () => {
    const [avatar, setAvatar] = useState({
        file: null,
        url: "",
    });

    const [loading, setLoading] = useState(false);
    const registerFormRef = useRef(null);

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(!loading);
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        // VALIDATE INPUTS
        if (!username || !email || !password)
            return toast.warn("Please enter inputs!");
        if (!avatar.file) return toast.warn("Please upload an avatar!");
        

        // VALIDATE UNIQUE USERNAME
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
             toast.warn("Select another username");
            registerFormRef.current.reset();
            setAvatar({
                file: null,
                url: ""
            });
            setLoading(false);
            return;
        }

        try {
            toast.loading("Creating account...");
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const imgUrl = await upload(avatar.file);
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            });
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });

            // send email verification
            await sendEmailVerification(res.user);
            toast.dismiss();
            toast.success("Account created! Please verify your email before logging in.");
            
            // RESET FORM
            registerFormRef.current.reset();
            setAvatar({
                file: null,
                url: "",
            });
        } catch (err) {
            console.log(err);
            
            toast.error(err.message ,{
                autoClose: 800,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {
            toast.loading("Signing in...");
            const res = await signInWithEmailAndPassword(auth, email, password);
            if (!res.user.emailVerified) {
                toast.dismiss();
                setLoading(false);
                return toast.error("Please verify your email before logging in.");
            }
            setLoading(false);
            toast.dismiss();
            toast.success("Logged in successfully!" , {
                autoClose: 500,
            
            });
        } catch (err) {
            console.log(err);
            toast.dismiss();
            toast.error(err.message ,{
                autoClose: 1200,
            });
        } finally {
            setLoading(false);
        }
    };

    // handles forgot password
    const handleForgotPassword = async () => {
        const email = prompt("Enter your email");
        if (email) {
            try {
                // Find the user by email
                const q = query(collection(db, "users"), where("email", "==", email));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    return toast.error("Email not found. Please check and try again.");
                }

                const userDoc = querySnapshot.docs[0];
                const userEmail = userDoc.data().email;

                toast.loading("Sending password reset email...");
                await sendPasswordResetEmail(auth, userEmail);
                toast.dismiss();

                // Format the email address
                const formattedEmail = `${userEmail.slice(0, 4)}****@${userEmail.split('@')[1]}`;
                toast.success(`Password reset email sent to ${formattedEmail}`, {
                    autoClose: 1000,
                });

            } catch (err) {
                console.log(err);
                toast.dismiss();
                toast.error(err.message, {
                    autoClose: 800,
                });
            }
        }

    };


    return (
        <div className="login">
            <div className="item">
                <h2>Welcome back</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
                    <button type="button" onClick={handleForgotPassword}>
                        Forgot password?</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister} ref={registerFormRef}>
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="" />
                        Upload an image
                    </label>
                    <input
                        type="file"
                        id="file"
                        style={{ display: "none" }}
                        onChange={handleAvatar}
                    />
                    <input type="text" placeholder="Username" name="username" />
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    );
};

export default Login;