import React from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../Hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router';
import SocialLogin from './SocialLogin/SocialLogin';
import axios from 'axios';
import useAxiosSecure from '../../Hooks/useAxiosSecure';

const Register = () => {

     const {register, handleSubmit, formState: {errors}} = useForm();
     const {registerUser, updateUserProfile} = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();



     const handleRegistration = (data) => {

             
              const profileImg = data.photo[0];

              registerUser(data.email, data.password)
              .then(()=> {
               
                //store the image and get the photo url
                    const formData = new FormData();
                    formData.append('image', profileImg);
                    const image_API_URL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_KEY}`
                    axios.post(image_API_URL, formData)
                    .then( res =>{
                        const photoURL =  res.data.data.url;


                     //Create user in the database
                    const userInfo = {
                           email: data.email,
                           displayName: data.name,
                           photoURL : photoURL
                    }

                     axiosSecure.post('/users', userInfo )
                      .then(res => {
                        if(res.data.insertedId){
                           console.log('User create in the database');
                        }
                      })


                      //Update user profile here
                       const userProfile = {
                          displayName : data.name,
                          photoURL : photoURL
                       }

                        updateUserProfile(userProfile)
                           .then( () => {
                              console.log('User profile updated done')
                              navigate(location.state || '/');
                           })
                           .catch(error => console.log(error))
                    })
                
              })
              .catch(error => {
                  console.log(error)
              })
     }

    return (
        <div>
            <form onSubmit={handleSubmit(handleRegistration)}>
             <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                 <div className="card-body">
                       <h3 className="text-3xl text-center font-bold">Welcome to ZapShift</h3>
                <h1 className="text-2xl font-bold text-center">Register now!</h1>
                <fieldset className="fieldset">


                  {/* Name   */}
                <label className="label">Name</label>
                <input type="text" {...register('name', {required: true})} className="input" placeholder="Your name" />

                 {
                    errors.name?.type === 'required' && <p className='text-red-500'>Name is required.</p>
                 } 

                  {/* Photo image field */}
                <label className="label">Photo</label>
         
                <input type="file" {...register('photo', {required: true})} className="file-input" placeholder="Your photo" />

                 {
                    errors.name?.type === 'required' && <p className='text-red-500'>Photo is required.</p>
                 }  


                  {/* Email   */}
                <label className="label">Email</label>
                <input type="email" {...register('email', {required: true})} className="input" placeholder="Email" />

                 {
                    errors.email?.type === 'required' && <p className='text-red-500'>Email is required.</p>
                 }                

                {/* password */}

                <label className="label">Password</label>
                <input type="password" {...register('password', {
                    required: true,
                    minLength: 6,
                    pattern : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,

                })} className="input" placeholder="Password" />

                 {
                    errors.password?.type === 'required' && <p className='text-red-500'>Password is required.</p>
                 }                
                 {
                    errors.password?.type === 'minLength' && <p className='text-red-500'>Password must be 6 characters or longer.</p>
                 }                
                 {
                    errors.password?.type === 'pattern' && <p className='text-red-500'>Password must contain uppercase, lowercase, number, and special character.</p>
                 }                


                <div><a className="link link-hover">Forgot password?</a></div>
                <button className="btn btn-neutral mt-4">Register</button>

                <p className='text-center text-lg'>Already have an account
                     <Link state={location.state} className='text-blue-600' to='/login'>login</Link></p>
                </fieldset>
                <SocialLogin></SocialLogin>
                
                </div>
                </div>

                
            </form>
               
        </div>
    );
};

export default Register;