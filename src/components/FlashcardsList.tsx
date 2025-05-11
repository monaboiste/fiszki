import React from "react";
import type { FlashcardDto } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { format } from "date-fns";

// Pagination component
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
}

interface FlashcardsListProps {
  flashcards: FlashcardDto[];
  isLoading: boolean;
  pagination: PaginationProps;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
}

const FlashcardsList: React.FC<FlashcardsListProps> = ({
  flashcards,
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}) => {
  const { page, limit, total } = pagination;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxDisplayedPages = 5;

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink onClick={() => onPageChange(1)} isActive={page === 1} className="cursor-pointer">
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Calculate range of pages to show
    const startPage = Math.max(2, page - Math.floor(maxDisplayedPages / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxDisplayedPages - 3);

    // Adjust if we're near the start
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => onPageChange(i)} isActive={page === i} className="cursor-pointer">
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Adjust if we're near the end
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            isActive={page === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, idx) => (
            <Card key={`skeleton-${idx}`} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))}
      </div>
    );
  }

  // No flashcards found
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          No flashcards found. Try adjusting your search or create new flashcards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((flashcard) => (
          <FlashcardItem key={flashcard.flashcard_id} flashcard={flashcard} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && onPageChange(page - 1)}
                className={`${page <= 1 ? "pointer-events-none opacity-50" : ""} cursor-pointer`}
              />
            </PaginationItem>

            {getPaginationItems()}

            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && onPageChange(page + 1)}
                className={`${page >= totalPages ? "pointer-events-none opacity-50" : ""} cursor-pointer`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

interface FlashcardItemProps {
  flashcard: FlashcardDto;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({ flashcard, onEdit, onDelete }) => {
  const lastUpdated = flashcard.updated_at
    ? format(new Date(flashcard.updated_at), "MMM d, yyyy")
    : format(new Date(flashcard.created_at), "MMM d, yyyy");

  return (
    <Card className="h-full flex flex-col" data-testid="flashcard-item">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg" data-testid="flashcard-item-front">
          {flashcard.front}
        </CardTitle>
        <CardDescription>Last updated: {lastUpdated}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-4 text-sm text-muted-foreground">{flashcard.back}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(flashcard.flashcard_id)} className="cursor-pointer">
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(flashcard.flashcard_id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FlashcardsList;
