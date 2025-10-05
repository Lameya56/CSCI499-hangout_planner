//also ignore still practicing react-hook-form

import { useForm } from "react-hook-form";
import {z} from "zod";
import { zodResolver} from "@hookform/resolvers/zod"

const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(10,"Passwords must be atleast 10 characters"),
    confirmPassword: z.string(),
}).refine(data=> data.password === data.confirmPassword, 
    {message:"Passwords must match",
     path: ["confirmPassword"] //matching field
    })
const Reacthook = () => {
    const { register, handleSubmit, formState: {errors, isSubmitting}, reset, getValues,
    } = useForm({
        resolver: zodResolver(signUpSchema)
    });
    const onSubmit = async(data) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        reset();
    }
    return(
        <div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-2">
            <input {...register("email", {required: "email is required"})} type="email" placeholder="email" className="px-4 py-2 rounded"></input>
            {errors.email && (<p className="text-red-500">{`${errors.email.message}`}</p>)}
            <input {...register("password", 
            {required: "password is required", 
                minLength:{
                value: 10,
                message: "password must be 10 character"}
            })} 
            type="password" 
            placeholder="password" 
            className="px-4 py-2 rounded"></input>
            {errors.password && (<p className="text-red-500">{`${errors.password.message}`}</p>)}
            <input {...register("confirmPassword",
            {required: "Confirm password is required",
             validate: (value) => 
                value === getValues("password") || "passwords must match",

            })} type="password" placeholder="confirm password" className="px-4 py-2 rounded"></input>
            {errors.confirmPassword && (<p className="text-red-500">{`${errors.confirmPassword.message}`}</p>)}
            <button disabled={isSubmitting} type="submit" className="bg-blue-500 disabled:bg-gray-500 py-2 rounded">Submit</button> 
        </form>

        </div>

    )
    
}
export default Reacthook;