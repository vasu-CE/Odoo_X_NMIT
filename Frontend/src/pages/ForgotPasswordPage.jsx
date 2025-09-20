import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";
import { Mail, Factory, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setEmailSent(true);
      toast.success("Reset instructions sent!", {
        description: "Please check your email for password reset instructions",
      });
    } catch (error) {
      toast.error("Failed to send email", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600">
              We've sent password reset instructions
            </p>
          </div>

          {/* Success Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Email Sent Successfully
                </h2>
                <p className="text-gray-600 mb-4">
                  We've sent password reset instructions to{" "}
                  <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Please check your email and follow the instructions to reset
                  your password.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Send to Different Email
                </Button>
                <Link to="/login">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>&copy; 2024 ManufacturingOS. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Factory className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ManufacturingOS
          </h1>
          <p className="text-gray-600">Production Management System</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Forgot Password?
            </CardTitle>
            <p className="text-center text-gray-600">
              No worries! Enter your email and we'll send you reset
              instructions.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending Instructions...
                  </div>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>&copy; 2024 ManufacturingOS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
