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
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../AuthContext.jsx"
const Login = () => {
    const { setAuthUser } = useAuth();
    const navigate = useNavigate();
    const {register, handleSubmit, formState:{errors, isSubmitting}, reset} = useForm();
      const onSubmit = async (data) => {
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            console.log(result);

            if (res.ok) {
                setAuthUser(result.user); // Set the authenticated user in the context
                localStorage.setItem("token", result.token) //storing the jwt
                navigate("/home"); // Redirect to dashboard/home page after successful login
            } else {
                alert(result.message);
            }
        } catch (err) {
            console.error(err.message);
        }
    };
    return(
        <div className="flex min-h-screen items-center justify-center">
           <Card className="w-full max-w-sm">
                <CardHeader className="space-y-2">
                    <div className="flex w-full items-center justify-between">
                        <CardTitle>Login to your account</CardTitle>
                         <Link to="/"> 
                        <Button variant="link">Sign Up</Button>
                        </Link>          
                    </div>
                    <CardDescription className="text-left">
                    Enter your email below to login to your account
                    </CardDescription>  
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-6">
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
                        {errors.email && (<p className="text-red-500">{`${errors.email.message}`}</p>) }
                        </div>
                        <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link 
                            to={"#"}
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                            Forgot your password?
                            </Link>    
                        </div>
                        <Input 
                        {...register("password",
                        {required:"Password is required"}
                        )}
                        id="password" 
                        type="password" required />
                        {errors.password && (<p className="text-red-500">{`${errors.password.message}`}</p>)}
                        
                        </div >
                        <div className="grid gap-2">
                        <Button type="submit" className="w-full">
                         Login
                        </Button>
                        </div>
                    </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
export default Login;