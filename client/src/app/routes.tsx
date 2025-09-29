import type {RouteObject} from 'react-router-dom'
import DashboardPage from './../modules/dashboard/DashboardPage'
import ProjectListPage from './../modules/projects/ProjectListPage'
import ProjectSettingsPage from './../modules/projects/ProjectSettingsPage'
import IssueListPage from './../modules/issues/IssueListPage'
import IssueBoardPage from './../modules/issues/IssueBoardPage'
import IssueFullPage from './../modules/issues/IssueFullPage'
import ProfilePage from "../modules/profile/ProfilePage.tsx";
import LoginPage from "../modules/auth/LoginPage.tsx";
import RegisterPage from "../modules/auth/RegisterPage.tsx";
import ProtectedRoute from "../modules/auth/ProtectedRoute.tsx";

export const routes: RouteObject[] = [
    {path: '/', element: <DashboardPage/>},
    {path: '/login', element: <LoginPage/>},
    {path: '/register', element: <RegisterPage/>},
    {
        element: <ProtectedRoute/>,
        children: [
            {path: '/profile', element: <ProfilePage/>},
            {path: '/dashboard', element: <DashboardPage/>},
            {path: '/projects', element: <ProjectListPage/>},
            {path: '/projects/:projectId', element: <IssueListPage/>},
            {path: '/projects/:projectId/settings/*', element: <ProjectSettingsPage/>},
            {path: '/projects/:projectId/board', element: <IssueBoardPage/>},
            {path: '/issues/:issueId', element: <IssueFullPage/>}
        ]
    }
]
