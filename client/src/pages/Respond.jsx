//lol ignore this i was practicing react-hook-form but we can update this to be the response form 
// this is the amount of work without react hook form 
import React, {useState} from 'react';
const Respond = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass]= useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async(e) =>{
        e.preventDefault();
        setIsSubmitting(true);
        //TODO: submit to server
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setEmail("");
        setPass("");
        setConfirmPassword("");
        setIsSubmitting(false)

    }
    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-y-2">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required autocomplete="on" className="px-4 py-2 rounded" ></input>
                <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" required className="px-4 py-2 rounded"></input>
                <input type="password" value={confirmPassword} onChange= {(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm Password" className="px-4 py-2 rounded"></input>
                <button type="submit" disabled={isSubmitting} className="bg-blue-500 disabled:bg-gray-500 py-2 rounded">Submit</button>      
            </form>
        </div>
    )
}
export default Respond;