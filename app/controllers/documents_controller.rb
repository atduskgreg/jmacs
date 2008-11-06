class DocumentsController < ApplicationController
  before_filter :load_document, :only => [:show, :update, :create, :destroy]
  
  def show
    begin
      @document.to_json
    rescue Exception => e
      @error =e.message
    end
    respond_to do |format|
      unless @error
        format.json  { render :json => "#{params[:callback]}(#{@document.to_json})" }
      else
        format.json  { render :json => @error.to_json, :status => 403 }
      end
    end
  end

  def create
    @document.content = params[:content]
    @document.save

    respond_to do |format|
      format.json  { render :json => "#{params[:callback]}(#{@document.to_json})" }
    end
  end

  def update
    @document.content = params[:content]
    @document.save

    respond_to do |format|
      format.json  { render :json => "#{params[:callback]}(#{@document.to_json})" }
    end
  end

  # DELETE /documents/1
  # DELETE /documents/1.xml
  def destroy
    @document.destroy

    respond_to do |format|
      format.json  { render :json => "#{params[:callback]}({success: true})" }
    end
  end
  
  def load_document
    begin
      @document = Document.new :path => params[:id].gsub(/\\056/, "."), :pwd => params[:pwd]
    rescue Exception => e
      @error =  e.message
    end
  end
end
