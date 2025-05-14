
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Mail } from 'lucide-react';

const VerifyEmail = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="mb-6 flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-primary">EduForge AI</h1>
        <p className="text-sm text-muted-foreground">
          Educational Content Creation Platform
        </p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Check Your Email
          </CardTitle>
          <CardDescription>
            We've sent you a verification link to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-6 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-12 w-12 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Please check your email inbox and click the verification link to complete your registration.
            If you don't see the email, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already verified?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            Back to{' '}
            <Link to="/" className="text-primary hover:underline">
              Homepage
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
