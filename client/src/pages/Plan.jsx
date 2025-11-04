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
import { useNavigate } from 'react-router-dom';
const Plan = () => {
    const navigate = useNavigate();
    const {register, control, handleSubmit,setValue, formState: {errors}, watch } = useForm({
        defaultValues:{
            activities: [{name: "", location: ""}],
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

    const {
        fields:dateFields,
        append: appendDate,
        remove: removeDate,
    } = useFieldArray({
        control,
        name: "dates",
    });

    const watchImage = watch("image");
    const watchFile = watch("imageUpload");
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
    if (watchImage) {
        if (preview !== watchImage) {
            setPreview(watchImage);
        }
        if (watchFile?.length) {
            setValue("imageUpload", []); // clear file if link entered
        }
    } else if (watchFile?.[0]) {
        const fileUrl = URL.createObjectURL(watchFile[0]);
        if (preview !== fileUrl) {
            setPreview(fileUrl);
        }
        if (watchImage) {
            setValue("image", ""); // clear link if file uploaded
        }
    } else {
        if (preview !== null) {
            setPreview(null);
        }
    }
}, [watchImage, watchFile]); // remove setValue from dependencies

    
    const handleRemoveImage = () => {
        setPreview(null);
        setValue("image", "");
        setValue("imageUpload", []);
    }

    const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const planData = {
        title: data.eventTitle,
        time: data.time,
        image: data.image || null,
        dates: data.dates.filter(d => d.name).map(d => ({ name: d.name })),
        activities: data.activities.filter(a => a.name && a.location),
        invites: data.invites.filter(i => i.email),
        deadline: data.deadline,
        hostVote: true
      };

      console.log('📤 Sending plan data:', planData);

      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });

      const result = await res.json();
      console.log('📥 Response:', result);

      if (res.ok) {
        alert('Plan created successfully! 🎉');
        navigate('/home');
      } else {
        alert(result.message || 'Failed to create plan');
      }
    } catch (err) {
      console.error('❌ Error creating plan:', err);
      alert('Failed to create plan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };
    return(
        <div className="flex min-h-screen items-center justify-center">
           <Card className="w-full max-w-sm lg:max-w-xl">
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
                                {...register("eventTitle")}
                                type="text"
                                placeholder="Event Title"
                                required
                            />
                            </div>
                            {/* DATE */}
                            <div className="grid gap-2">
                            <Label htmlFor="date">Add a date:</Label>
                            {dateFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                {/* <Label className="flex items-center gap-2">
                                    <Input
                                    type="checkbox"
                                    className={"w-4 h-4"}
                                    {...register(`dates.${index}.selected`)}
                                />
                                </Label> */}
                                <Input
                                {...register(`dates.${index}.name`, {
                                    required: {value: true, message: "this is requried"}}, {ValueAsDate: true})}
                                type="date"
                                />
                                <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removeDate(index)}
                                >
                                    Remove
                                </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={()=> appendDate({name:""})}
                            >
                                + Add Date
                            </Button>
                            </div>
                            {/* TIME */}
                            <div className="grid gap-2">
                            <Label>Set a Time:</Label>
                            <Input
                                id="time"
                                {...register("time", {required: true})}
                                type="time"
                            />
                            </div>
                            {/* Image Link */}
                            <div className="grid gap-2">
                            <Label className="font-semibold">Event Image </Label>
                            <div className="flex flex-col lg:flex-row gap-2 items-center">
                            {/* URL Input */}
                            <Input
                                id="image"                               
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                pattern="https://.*"
                                className="flex-1"
                                {...register("image", {
                                    validate: value => {
                                        if(!value && !watchFile?.length){
                                            return "Provide either an image URL or upload a file.";
                                        }
                                        return true;
                                    }
                                })}
                            />
                            <Label
                                htmlFor="imageUpload"
                                className="flex items-center justify-center w-full lg:w-auto px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium"
                                >
                                Upload File
                                <Input
                                    id="imageUpload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    {...register("imageUpload", {
                                        validate: value => {
                                            if (!value?.length && !watchImage) {
                                                return "Provide either an image URL or upload a file.";
                                            }
                                            return true;
                                        }
                                    })}
                                />
                                
                                </Label>
                            </div>
                            {/*Preview Section */}
                            {preview && (
                                <div className="relative mt-3 w-40 h-40">
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-full h-full object-cover rounded-lg border"
                                />
                                <Button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center hover:bg-red-600"
                                >
                                    x
                                </Button>
                                </div>
                            )}

                            {/* Error Check */}
                            {(errors.image || errors.imageUpload) && (
                                <p className="text-red-500 text-sm">
                                    {errors.image?.message || errors.imageUpload?.message}
                                </p>
                            )}
                            </div>
                            {/* ACTIVITIES WITH VOTING */}
                            <div className="grid gap-2">
                                <Label>Activities (Click Checkbox to Vote)</Label>
                                {activityFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                    {/* checkbox */}
                                    {/* <Label className="flex items-center gap-2">
                                        <Input
                                            type="checkbox"
                                            className={"w-4 h-4"}
                                            {...register(`activities.${index}.selected`)}
                                        />
                                    </Label> */}
                                    {/* activity name input */}
                                    <Input
                                        {...register(`activities.${index}.name`, { required: true })}
                                        placeholder={`Activity ${index + 1}`}
                                        className="flex-1"
                                    />
                                    {/* Location */}
                                    <Input
                                        {...register(`activities.${index}.location`, {required: true})}
                                        placeholder="Location"
                                        className="flex-1"
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