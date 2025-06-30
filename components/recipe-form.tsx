"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChefHat,
  Clock,
  Users,
  Utensils,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  RecipeRequestSchema,
  RecipeRequestFormData,
  DIETARY_RESTRICTIONS,
  sanitizeIngredientList,
} from "@/types/recipe";

interface RecipeFormProps {
  onSubmit: (request: RecipeRequestFormData) => void;
  isLoading: boolean;
}

export function RecipeForm({ onSubmit, isLoading }: RecipeFormProps) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, touchedFields },
    trigger,
  } = useForm<RecipeRequestFormData>({
    resolver: zodResolver(RecipeRequestSchema),
    defaultValues: {
      mainDish: "",
      dietaryRestrictions: [],
      availableIngredients: "",
      maxCookingTime: 60,
      servingSize: 4,
    },
    mode: "onChange", // Enable real-time validation
  });

  const watchedValues = watch();
  const cookingTime = watch("maxCookingTime");
  const dietaryRestrictions = watch("dietaryRestrictions");

  const handleDietaryChange = (restriction: string, checked: boolean) => {
    const current = watchedValues.dietaryRestrictions || [];
    let updated: string[];

    if (checked) {
      updated = [...current, restriction];
    } else {
      updated = current.filter((r) => r !== restriction);
    }

    setValue("dietaryRestrictions", updated, {
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const handleIngredientsBlur = (value: string) => {
    if (value.trim()) {
      const sanitized = sanitizeIngredientList(value);
      setValue("availableIngredients", sanitized, {
        shouldValidate: true,
      });
    }
  };

  const getCookingTimeLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const onFormSubmit = (data: RecipeRequestFormData) => {
    onSubmit(data);
  };

  const getFieldError = (fieldName: keyof RecipeRequestFormData) => {
    return errors[fieldName]?.message;
  };

  const isFieldTouched = (fieldName: keyof RecipeRequestFormData) => {
    return touchedFields[fieldName];
  };

  const isFieldValid = (fieldName: keyof RecipeRequestFormData) => {
    return isFieldTouched(fieldName) && !errors[fieldName];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center px-4 sm:px-6">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <ChefHat
              className="w-6 h-6 sm:w-8 sm:h-8 text-primary"
              aria-hidden="true"
            />
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
          Your Culinary Assistant
        </CardTitle>
        <CardDescription className="text-base sm:text-lg text-muted-foreground">
          Tell me about your cooking situation, and I'll create the perfect
          recipe for you
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="space-y-6"
          noValidate
        >
          {/* Main Dish Field */}
          <div className="space-y-2">
            <Label
              htmlFor="mainDish"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Utensils className="w-4 h-4" aria-hidden="true" />
              What would you like to cook?
              <span className="text-destructive" aria-label="required">
                *
              </span>
            </Label>
            <div className="relative">
              <Input
                id="mainDish"
                {...register("mainDish")}
                placeholder="e.g., chicken parmesan, vegan lasagna, beef stir-fry..."
                className={`text-base pr-10 ${
                  errors.mainDish
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : isFieldValid("mainDish")
                    ? "border-success focus-visible:ring-success/20"
                    : ""
                }`}
                disabled={isLoading}
                aria-invalid={!!errors.mainDish}
                aria-describedby={
                  errors.mainDish ? "mainDish-error" : "mainDish-hint"
                }
              />
              {isFieldValid("mainDish") && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                </div>
              )}
            </div>

            {errors.mainDish && (
              <div
                id="mainDish-error"
                className="flex items-center gap-2 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.mainDish.message}</span>
              </div>
            )}

            <div id="mainDish-hint" className="text-xs text-muted-foreground">
              Be specific for better results (e.g., "Italian pasta" instead of
              just "pasta")
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Dietary Preferences & Restrictions
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DIETARY_RESTRICTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dietary-${option}`}
                    checked={dietaryRestrictions?.includes(option) || false}
                    onCheckedChange={(checked) =>
                      handleDietaryChange(option, checked as boolean)
                    }
                    disabled={isLoading}
                    aria-describedby={`dietary-${option}-desc`}
                  />
                  <Label
                    htmlFor={`dietary-${option}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                  <span id={`dietary-${option}-desc`} className="sr-only">
                    Select if you follow a {option.toLowerCase()} diet
                  </span>
                </div>
              ))}
            </div>

            {errors.dietaryRestrictions && (
              <div
                className="flex items-center gap-2 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.dietaryRestrictions.message}</span>
              </div>
            )}

            {dietaryRestrictions && dietaryRestrictions.length > 0 && (
              <div
                className="flex flex-wrap gap-2 mt-3"
                role="region"
                aria-label="Selected dietary restrictions"
              >
                {dietaryRestrictions.map((restriction) => (
                  <Badge
                    key={restriction}
                    variant="secondary"
                    className="text-xs"
                  >
                    {restriction}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Available Ingredients */}
          <div className="space-y-2">
            <Label
              htmlFor="availableIngredients"
              className="text-sm font-medium"
            >
              Ingredients You Have{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="availableIngredients"
              {...register("availableIngredients")}
              placeholder="e.g., chicken breast, tomatoes, garlic, olive oil, pasta..."
              className={`resize-none min-h-[80px] ${
                errors.availableIngredients
                  ? "border-destructive focus-visible:ring-destructive/20"
                  : ""
              }`}
              rows={3}
              disabled={isLoading}
              aria-describedby="ingredients-hint"
              onBlur={(e) => handleIngredientsBlur(e.target.value)}
            />

            {errors.availableIngredients && (
              <div
                className="flex items-center gap-2 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.availableIngredients.message}</span>
              </div>
            )}

            <div
              id="ingredients-hint"
              className="text-xs text-muted-foreground"
            >
              List key ingredients you'd like to use. I'll try to incorporate
              them into your recipe. Separate with commas or new lines.
            </div>
          </div>

          {/* Cooking Time Slider */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" aria-hidden="true" />
              Maximum Cooking Time: {getCookingTimeLabel(cookingTime)}
            </Label>

            <Controller
              name="maxCookingTime"
              control={control}
              render={({ field }) => (
                <div className="px-2">
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={480}
                    min={15}
                    step={15}
                    className="w-full"
                    disabled={isLoading}
                    aria-label={`Maximum cooking time: ${getCookingTimeLabel(
                      field.value
                    )}`}
                  />
                </div>
              )}
            />

            <div className="flex justify-between text-xs text-muted-foreground px-2">
              <span>15 min</span>
              <span>8 hours</span>
            </div>

            {errors.maxCookingTime && (
              <div
                className="flex items-center gap-2 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.maxCookingTime.message}</span>
              </div>
            )}
          </div>

          {/* Serving Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" aria-hidden="true" />
              Number of Servings
            </Label>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const current = watch("servingSize");
                  const newValue = Math.max(1, current - 1);
                  setValue("servingSize", newValue, { shouldValidate: true });
                }}
                disabled={watch("servingSize") <= 1 || isLoading}
                aria-label="Decrease servings"
              >
                -
              </Button>

              <div className="flex-1">
                <Input
                  {...register("servingSize", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="20"
                  className={`text-center text-lg font-medium ${
                    errors.servingSize
                      ? "border-destructive focus-visible:ring-destructive/20"
                      : isFieldValid("servingSize")
                      ? "border-success focus-visible:ring-success/20"
                      : ""
                  }`}
                  disabled={isLoading}
                  aria-invalid={!!errors.servingSize}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const current = watch("servingSize");
                  const newValue = Math.min(20, current + 1);
                  setValue("servingSize", newValue, { shouldValidate: true });
                }}
                disabled={watch("servingSize") >= 20 || isLoading}
                aria-label="Increase servings"
              >
                +
              </Button>
            </div>

            {errors.servingSize && (
              <div
                className="flex items-center gap-2 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.servingSize.message}</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              1-20 servings
            </p>
          </div>

          {/* Form Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">
                  Please fix the following errors:
                </span>
              </div>
              <ul className="text-sm text-destructive space-y-1 ml-6">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="list-disc">
                    {error?.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full text-base font-medium py-6"
            disabled={isLoading || !isValid}
            aria-describedby="submit-help"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="w-5 h-5 mr-2 animate-spin"
                  aria-hidden="true"
                />
                Generating Your Recipe...
                <span className="sr-only">
                  Please wait while we generate your recipe
                </span>
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5 mr-2" aria-hidden="true" />
                Generate Recipe
              </>
            )}
          </Button>

          <div
            id="submit-help"
            className="text-xs text-muted-foreground text-center"
          >
            This usually takes 10-30 seconds. Form validation ensures the best
            results.
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
