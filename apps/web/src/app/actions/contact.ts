'use server'

import { z } from 'zod'

// Define validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

// Type for form state
type FormState = {
  success?: boolean
  message?: string
  errors?: {
    name?: string[]
    email?: string[]
    message?: string[]
  }
}

export async function submitContactForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Extract form data
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  }

  // Validate with Zod
  const validatedFields = contactSchema.safeParse(rawData)

  // Return validation errors if any
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Simulate API call or database operation
  try {
    // In production: await db.contacts.create(validatedFields.data)
    // In production: await sendEmail(validatedFields.data)

    console.log('Contact form submitted:', validatedFields.data)

    return {
      success: true,
      message: 'Message sent successfully!',
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return {
      message: 'Failed to send message. Please try again.',
    }
  }
}