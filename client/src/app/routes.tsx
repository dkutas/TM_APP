import type {RouteObject} from 'react-router-dom'
import ProjectListPage from './../modules/projects/ProjectListPage'
import {ProjectSettingsPage} from '../modules/projects/ProjectAdmin/ProjectSettingsPage.tsx'
import IssueListPage from './../modules/issues/IssueListPage'
import IssueFullPage from './../modules/issues/IssueFullPage'
import ProfilePage from "../modules/profile/ProfilePage.tsx";
import LoginPage from "../auth/LoginPage.tsx";
import RegisterPage from "../auth/RegisterPage.tsx";
import ProtectedRoute from "../auth/ProtectedRoute.tsx";
import WelcomePage from "../modules/welcome/WelcomePage.tsx";
import ProjectPage from "../modules/projects/ProjectPage.tsx";
import ProjectIssuesListPage from "../modules/projects/ProjectIssuesListPage.tsx";
import SettingsPage from "../modules/settings/SettingsPage.tsx";
import {IssueTypeSettings} from "../modules/settings/IssueTypes/IssueTypeSettings.tsx";
import {CustomFieldsSettings} from "../modules/settings/CustomFields/CustomFieldsSettings.tsx";
import {WorkflowSettings} from "../modules/settings/Workflows/WorkflowSettings.tsx";
import {CustomFieldContexts} from "../modules/settings/CustomFields/CustomFieldContexts.tsx";
import EditWorkflow from "../modules/settings/Workflows/EditWorkflow.tsx";

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
            {path: '/issues/:issueId', element: <IssueFullPage/>},
            {
                path: '/settings', element: <SettingsPage/>, children: [
                    {path: "issue-types", element: <IssueTypeSettings/>},
                    {path: "custom-fields", element: <CustomFieldsSettings/>},
                    {path: "custom-fields/:id/contexts", element: <CustomFieldContexts/>},
                    {path: "workflows", element: <WorkflowSettings/>},
                    {path: 'workflows/:workflowId', element: <EditWorkflow/>},
                    {path: 'workflows/:workflowId/:view', element: <EditWorkflow/>}

                ]
            }
        ]
    }
]
