import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom" 
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react"

const SignUp = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect');
    const {register, handleSubmit, formState: {errors, isSubmitting}, getValues, reset} = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const onSubmit = async(data) => {
        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            console.log(result);
        if (res.ok) {
                
                alert('Account created successfully! Please log in.');
                
                // ✅ ADDED: Redirect to login, passing the 'redirect' param if it exists
                if (redirectTo) {
                    navigate(`/login?redirect=${redirectTo}`);
                } else {
                    navigate('/login');
                }
            } else {
                alert(result.message || 'Signup failed');
            }

        } catch (err) {
            console.error(err.message);
        }
        
    }
    return(
        <>
        <h1> Welcome to Let's Go!</h1>
        <div className="flex min-h-screen items-center justify-center">
           
            <Card className="w-full max-w-sm">
                    <CardHeader className="space-y-2">
                        <div className="flex w-full items-center justify-between">
                            <CardTitle>Sign Up </CardTitle>
                            <Link to="/login">
                            <Button variant="link">Log In</Button>
                            </Link> 

                        </div>
                        <CardDescription className="text-left">
                        Enter your name and email below to create an account
                        </CardDescription>    
                    </CardHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent>
                            {/* Name */}
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                <Label htmlFor="Name">Name</Label>
                                <Input
                                    {...register("name", 
                                    {required: "Name is required"} 
                                    )}
                                    id="name"
                                    type="text"
                                    placeholder="Enter your Name"
                                />
                                {errors.name && (<p className="text-red-500">{`${errors.name.message}`}</p>)}
                                </div>
                                
                                {/* Email */}
                                <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    {...register("email", 
                                    {required: "Email is required"}
                                    )}
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"    
                                />
                                {errors.email && (<p className="text-red-500">{`${errors.email.message}`}</p>)}
                                </div>

                                {/* Password */}
                                <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Link to={"/Login"} className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                                        Forgot your password?
                                    </Link>                    
                                </div>

                                <div className="relative">
                                    <Input
                                    {...register("password",
                                    {required: "Password is required",
                                    minLength:{
                                        value: 6,
                                        message: "Password must be at least 6 characters"}
                                    })}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create New Password"
                                    className="pr-10"
                                    />

                                    <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {errors.password && (<p className="text-red-500">{`${errors.password.message}`}</p>) }
                                </div>

                                {/* Confirm Password */}
                                <div className="grid gap-2">
                                <Label htmlFor="confirm password">Confirm Password</Label>

                                <div className="relative">
                                    <Input
                                    {...register("confirmPassword",
                                        {required:"Confirm Password is required",
                                        validate: (value) =>
                                            value === getValues("password") || "Passwords must match",
                                        }
                                    )}
                                    id="confirm password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    className="pr-10"
                                    />

                                    <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {errors.confirmPassword && (<p className="text-red-500">{`${errors.confirmPassword.message}`}</p>)}
                                </div>

                                {/* SUBMIT */}
                                <div className="grid gap-2">
                                <Button 
                                disabled={isSubmitting} 
                                type="submit" 
                                className="w-full">
                                Sign Up
                                </Button>
                                </div>
                            </div>
                        </CardContent>
                    </form>                                 
                </Card>
        </div>
    </>
    )
}
export default SignUp;