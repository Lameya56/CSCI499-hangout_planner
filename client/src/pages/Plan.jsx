import React,{useState, useEffect} from 'react';
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
import { useForm, useFieldArray } from 'react-hook-form';
const Plan = () => {
    const {register, control, handleSubmit, formState: {errors} } = useForm({
        defaultValues:{
            activities: [{name: ""}],
            invites: [{email: ""}],
        }
    });
    const {
        fields: activityFields, 
        append: appendActivity, 
        remove: removeActivity,
    } = useFieldArray({
        control,
        name: "activities"
    });
    
    const {
        fields:inviteFields,
        append: appendInvite,
        remove: removeInvite,
    } = useFieldArray({
        control,
        name: "invites",
    });
    
    const onSubmit = (data) => {
        console.log("Form Data:", data);
        //send to backend db here
    }
    console.log("errors", errors)
    return(
        <div className="flex min-h-screen items-center justify-center">
           <Card className="w-full max-w-sm">
                <CardHeader className="space-y-2">
                    <div >
                        <CardTitle className="text-xl font-bold">Plan a Hang! </CardTitle>               
                    </div> 
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)} >
                    <CardContent className="space-y-6">   
                        <div className="flex flex-col gap-4">
                            <Label>Event Title</Label>
                            <div className="grid gap-2">
                            <textarea className="border border-white p-4"
                                {...register("eventTile")}
                                type="text"
                                placeholder="Event Title"
                                required
                            />
                            </div>
                            {/* DATE */}
                            <div className="grid gap-2">
                            <Label htmlFor="date">Set a date:</Label>
                            <Input
                                {...register("date", {required: {value: true, message: "this is requried"}}, {ValueAsDate: true})}
                                type="date"
                            />
                            </div>
                            {/* TIME */}
                            <div className="grid gap-2">
                            <Label>Add a Time:</Label>
                            <Input
                                id="time"
                                {...register("time", {required: true})}
                                type="time"
                            />
                            </div>
                            {/* Image Link */}
                            <div className="grid gap-2">
                            <Label>Image Link </Label>
                            <Input
                                id="image"
                                {...register("image")}
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                pattern="https://.*"
                                // value={linkUrl}
                                // onChange= {(e)=>setLinkUrl(e.target.value)}
                                required
                            />
                            </div>
                            {/* ACTIVITIES WITH VOTING */}
                            <div className="grid gap-2">
                                <Label>Activities (friends can vote)</Label>
                                {activityFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                    <Input
                                        {...register(`activities.${index}.name`, { required: true })}
                                        placeholder={`Activity ${index + 1}`}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => removeActivity(index)}
                                    >
                                        Remove
                                    </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => appendActivity({ name: "" })}
                                >
                                    + Add Activity
                                </Button>
                                </div>
                                {/*Invite people via Email */}
                                <div className="grid gap-2">
                                    <Label>Invite Friends (emails)</Label>
                                    {inviteFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2">
                                        <Input
                                            type="email"
                                            {...register(`invites.${index}.email`, { required: true })}
                                            placeholder={`friend${index + 1}@example.com`}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => removeInvite(index)}
                                        >
                                            Remove
                                        </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => appendInvite({ email: "" })}
                                    >
                                        + Add Invite
                                    </Button>
                                </div>
                                {/* FORM CLOSING DEADLINE */}
                                <div className="grid gap-2 mb-8">
                                    <Label htmlFor="deadline"> Form Closing Deadline</Label>
                                    <Input 
                                    {...register("deadline", {required: true})}
                                    type = "datetime-local"
                                    />
                                </div>

                            

                        </div>     
                    </CardContent>
                    <CardFooter className="flex-col gap-2 mb-5">
                        <Button type="submit" className="w-full">
                                Create Plan
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
export default Plan;