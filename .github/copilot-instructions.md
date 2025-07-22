# Copilot Instructions for Hospitality Management System

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Hospitality Management System with the following components:
- Node.js backend API with Express
- SQL Server database with stored procedures
- Simple HTML/CSS/JavaScript frontend
- Core feature: Real-time room availability checking

## Key Features
- User authentication for hotel staff
- Hotel and room registration
- Room availability checking with date overlap logic
- Reservation management (create, check-in, check-out, cancel)
- Automatic bill generation
- Alternative room suggestions

## Code Style Guidelines
- Use ES6+ JavaScript features
- Follow RESTful API conventions
- Use async/await for database operations
- Implement proper error handling
- Use meaningful variable and function names
- Add comments for complex business logic

## Database
- SQL Server with relational schema
- Use parameterized queries to prevent SQL injection
- All business logic implemented as stored procedures
- Proper foreign key relationships and constraints
