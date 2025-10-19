import type {RouteObject} from 'react-router-dom'
import ProjectListPage from './../modules/projects/ProjectListPage'
import ProjectSettingsPage from './../modules/projects/ProjectSettingsPage'
import IssueListPage from './../modules/issues/IssueListPage'
// import IssueBoardPage from './../modules/issues/IssueBoardPage'
import IssueFullPage from './../modules/issues/IssueFullPage'
import ProfilePage from "../modules/profile/ProfilePage.tsx";
import LoginPage from "../auth/LoginPage.tsx";
import RegisterPage from "../auth/RegisterPage.tsx";
import ProtectedRoute from "../auth/ProtectedRoute.tsx";
import WelcomePage from "../modules/welcome/WelcomePage.tsx";
import ProjectPage from "../modules/projects/ProjectPage.tsx";
import ProjectIssuesListPage from "../modules/projects/ProjectIssuesListPage.tsx";

export const routes: RouteObject[] = [
    {path: '/', element: <WelcomePage/>},
    {path: '/login', element: <LoginPage/>},
    {path: '/register', element: <RegisterPage/>},
    {path: '/welcome', element: <WelcomePage/>},
    {
        element: <ProtectedRoute/>,
        children: [
            {path: '/profile', element: <ProfilePage/>},
            {path: '/projects', element: <ProjectListPage/>},
            {path: '/issues', element: <IssueListPage/>},
            {path: '/projects/:projectId', element: <ProjectPage/>},
            {path: '/projects/:projectId/issues', element: <ProjectIssuesListPage/>},
            {path: '/projects/:projectId/settings/*', element: <ProjectSettingsPage/>},
            // {path: '/projects/:projectId/board', element: <IssueBoardPage/>},
            {path: '/issues/:issueId', element: <IssueFullPage/>}
        ]
    }
]
