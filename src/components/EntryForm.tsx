"use client"

import { useState } from "react"
import { Calendar, Video, MessageSquare, Briefcase, Home } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface EntryFormData {
  date: string
  videos: number
  workedMarketing: boolean
  leave: boolean
  comment: string
}

export default function EntryForm() {
  const [formData, setFormData] = useState<EntryFormData>({
    date: new Date().toISOString().split('T')[0],
    videos: 0,
    workedMarketing: false,
    leave: false,
    comment: ""
  })

  const [errors, setErrors] = useState<Partial<EntryFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<EntryFormData> = {}
    
    // Validate date (must be <= today)
    const today = new Date().toISOString().split('T')[0]
    if (formData.date > today) {
      newErrors.date = "Date cannot be in the future"
    }

    // Validate videos (must be >= 0)
    if (formData.videos < 0) {
      newErrors.videos = "Videos cannot be negative"
    }

    // Validate comment is required when videos == 1
    if (formData.videos === 1 && !formData.comment.trim()) {
      newErrors.comment = "Comment is required when videos count is 1"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Here you would typically send the data to your backend
      console.log("Form submitted:", formData)
      alert("Entry submitted successfully!")
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        videos: 0,
        workedMarketing: false,
        leave: false,
        comment: ""
      })
      setErrors({})
    }
  }

  const handleInputChange = (field: keyof EntryFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Calendar className="h-5 w-5 text-blue-400" />
          Daily Entry Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-200">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              max={getMaxDate()}
              className="bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-500"
            />
            {errors.date && (
              <p className="text-sm text-red-400">{errors.date}</p>
            )}
          </div>

          {/* Videos Input */}
          <div className="space-y-2">
            <Label htmlFor="videos" className="text-slate-200 flex items-center gap-2">
              <Video className="h-4 w-4" />
              Number of Videos
            </Label>
            <Input
              id="videos"
              type="number"
              min="0"
              value={formData.videos}
              onChange={(e) => handleInputChange('videos', parseInt(e.target.value) || 0)}
              className="bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-500"
              placeholder="Enter number of videos"
            />
            {errors.videos && (
              <p className="text-sm text-red-400">{errors.videos}</p>
            )}
          </div>

          {/* Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Switch
                id="workedMarketing"
                checked={formData.workedMarketing}
                onCheckedChange={(checked) => handleInputChange('workedMarketing', checked)}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="workedMarketing" className="text-slate-200 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Worked on Marketing
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="leave"
                checked={formData.leave}
                onCheckedChange={(checked) => handleInputChange('leave', checked)}
                className="data-[state=checked]:bg-red-600"
              />
              <Label htmlFor="leave" className="text-slate-200 flex items-center gap-2">
                <Home className="h-4 w-4" />
                On Leave
              </Label>
            </div>
          </div>

          {/* Comment Input */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-slate-200 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comment {formData.videos === 1 && <span className="text-red-400">*</span>}
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              placeholder={formData.videos === 1 ? "Comment is required when videos count is 1" : "Add any additional comments..."}
              className="bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-500 min-h-[100px]"
            />
            {errors.comment && (
              <p className="text-sm text-red-400">{errors.comment}</p>
            )}
            {formData.videos === 1 && !errors.comment && (
              <p className="text-sm text-blue-400">Comment is required for this entry</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
