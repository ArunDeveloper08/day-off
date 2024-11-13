// import { Button } from '@mui/material';
// import React, { Component } from 'react';

// class ErrorBoundary extends Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(error) {
//     // Update state so the next render will show the fallback UI
//     return { hasError: true };
//   }

//   componentDidCatch(error, errorInfo) {
//     // You can log the error to an error reporting service
//     console.error("Error caught by ErrorBoundary:", error, errorInfo);
//   }

//   resetError = () => {
//     this.setState({ hasError: false });
//   };

//   render() {
//     if (this.state.hasError) {
//       // Fallback UI when an error occurs
//       return (
//         <div className='h-80 w-full flex flex-col items-center justify-center gap-y-10'>
//           <h2 className='text-2xl'>Something went wrong.</h2>
//           <Button variant='contained' onClick={this.resetError}>Try Again</Button>
//         </div>
//       );
//     }

//     // Render children if there's no error
//     return this.props.children;
//   }
// }
// export default ErrorBoundary;





import React, { Component } from 'react';
// import { Button } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorKey: 0, // Used to trigger re-render when error is reset
    };
  }

  static getDerivedStateFromError(error) {
    // This method is triggered when an error is thrown by a child component
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // This method is called when an error is caught by the boundary
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Automatically reset the error state after a short delay (2 seconds)
    if (this.state.hasError) {
      setTimeout(() => {
        this.setState({
          hasError: false, // Reset the error flag
          errorKey: this.state.errorKey + 1, // Increment key to force re-mount
        });
      }, 1); // 1 mili seconds timeout
    }
  }
  
  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="h-80 w-full flex flex-col items-center justify-center gap-y-10">
          <h2 className="text-2xl">Retrying...</h2>
        </div>
      );
    }

    // Render children with a unique key to force remount when the error is reset
    return React.cloneElement(this.props.children, { key: this.state.errorKey });
  }
}

export default ErrorBoundary;
