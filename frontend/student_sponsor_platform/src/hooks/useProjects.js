import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsService, applicationsService } from '@/services'
import toast from 'react-hot-toast'

export const useProjects = (params) =>
  useQuery({ queryKey: ['projects', params], queryFn: () => projectsService.list(params).then(r => r.data) })

export const useProject = (id) =>
  useQuery({ queryKey: ['project', id], queryFn: () => projectsService.detail(id).then(r => r.data), enabled: !!id })

export const useProjectApplicants = (id) =>
  useQuery({ queryKey: ['applicants', id], queryFn: () => projectsService.getApplicants(id).then(r => r.data), enabled: !!id })

export const useMyApplications = () =>
  useQuery({ queryKey: ['my-applications'], queryFn: () => applicationsService.mine().then(r => r.data) })

export const useCreateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => projectsService.create(data),
    onSuccess:  () => { qc.invalidateQueries(['projects']); toast.success('Project created!') },
    onError:    (e) => toast.error(e?.response?.data?.detail || 'Failed to create project'),
  })
}

export const useApply = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => projectsService.apply(projectId, data),
    onSuccess:  () => { qc.invalidateQueries(['project', projectId]); toast.success('Application submitted!') },
    onError:    (e) => toast.error(e?.response?.data?.detail || 'Failed to apply'),
  })
}

export const useUpdateApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => applicationsService.update(id, data),
    onSuccess:  () => { qc.invalidateQueries(['applicants']); qc.invalidateQueries(['my-applications']); toast.success('Updated!') },
    onError:    (e) => toast.error(e?.response?.data?.detail || 'Failed to update'),
  })
}
