"use client";

import Link from "next/link";
import React, { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result?.code) {
        handleError(result);
        return;
      }

      toast.success("Signup successful!", { id: "signup_success" });
      setFormData({ username: "", email: "", password: "" });
    } catch (err: any) {
      toast.error(
        `Error submitting form: ${err.message || "An unknown error occurred"}`,
        { id: "error_while_submitting" }
      );
    }
  };

  const handleError = (result: any) => {
    switch (result.code) {
      case "DUPLICATE_KEY_ERROR":
        toast.error(`Error: ${result.message}`, { id: "signup_error" });
        break;
      case "VALIDATION_ERROR":
        result.errors.forEach((error: string) =>
          toast.error(error, { id: "signup_error" })
        );
        break;
      case "MISSING_FIELDS":
        toast.error(`Error: ${result.message}`, { id: "signup_error" });
        break;
      default:
        toast.error("An unknown error occurred", { id: "signup_error" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <label htmlFor="username" className="block text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Already have an account?</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Go to login page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
