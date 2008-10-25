class DocumentsController < ApplicationController
  before_filter :load_document, :only => [:show, :update, :create]
  
  # GET /documents
  # GET /documents.xml
  def index
    @documents = Document.find(:all)

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @documents }
    end
  end

  # GET /documents/1
  # GET /documents/1.xml
  def show
    respond_to do |format|
      format.json  { render :json => "#{params[:callback]}(#{@document.to_json})" }
    end
  end

  # GET /documents/new
  # GET /documents/new.xml
  def new
    @document = Document.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @document }
    end
  end

  # GET /documents/1/edit
  def edit
    @document = Document.find(params[:id])
  end

  # POST /documents
  # POST /documents.xml
  def create
    @document.content = params[:content]
    @document.save

    respond_to do |format|
      format.json  { render :json => "#{params[:callback]}(#{@document.to_json})" }
    end
  end

  # PUT /documents/1
  # PUT /documents/1.xml
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
    @document = Document.find(params[:id])
    @document.destroy

    respond_to do |format|
      format.html { redirect_to(documents_url) }
      format.xml  { head :ok }
    end
  end
  
  def load_document
    @document = Document.new :path => params[:id].gsub(/\\056/, "."), :pwd => params[:pwd]
  end
end
